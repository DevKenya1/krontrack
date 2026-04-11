from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from .models import TimeEntry, Break, AuditLog
from .serializers import (
    TimeEntrySerializer, BreakSerializer,
    ClockInSerializer, ClockOutSerializer, AuditLogSerializer
)


class TimeEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimeEntrySerializer
    filterset_fields = ['employee', 'status', 'clock_in_method']
    ordering_fields = ['clock_in', 'clock_out', 'created_at']

    def get_queryset(self):
        user = self.request.user
        employee = user.employee_profile
        if employee.role in ('admin', 'hr'):
            return TimeEntry.objects.select_related('employee__user').all()
        if employee.role == 'manager':
            return TimeEntry.objects.select_related('employee__user').filter(
                employee__in=employee.direct_reports.all()
            ) | TimeEntry.objects.filter(employee=employee)
        return TimeEntry.objects.filter(employee=employee)

    @action(detail=False, methods=['post'], url_path='clock-in')
    def clock_in(self, request):
        serializer = ClockInSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        employee = request.user.employee_profile
        entry = TimeEntry.objects.create(
            employee=employee,
            clock_in=timezone.now(),
            clock_in_method=serializer.validated_data.get('method', 'web'),
            clock_in_lat=serializer.validated_data.get('latitude'),
            clock_in_lng=serializer.validated_data.get('longitude'),
            notes=serializer.validated_data.get('notes', ''),
            status='active',
        )
        AuditLog.objects.create(
            actor=employee, target_employee=employee,
            action='clock_in', model_name='TimeEntry',
            object_id=str(entry.id),
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response(TimeEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='clock-out')
    def clock_out(self, request):
        employee = request.user.employee_profile
        try:
            entry = TimeEntry.objects.get(employee=employee, clock_out__isnull=True)
        except TimeEntry.DoesNotExist:
            return Response({'error': 'You are not clocked in.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ClockOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        entry.clock_out = timezone.now()
        entry.clock_out_method = serializer.validated_data.get('method', 'web')
        entry.clock_out_lat = serializer.validated_data.get('latitude')
        entry.clock_out_lng = serializer.validated_data.get('longitude')
        entry.status = 'completed'

        if entry.duration_hours:
            from django.conf import settings
            ot_settings = settings.KRONTRACK_SETTINGS
            daily_threshold = ot_settings['DEFAULT_OVERTIME_DAILY_HOURS']
            hours = entry.duration_hours
            if hours > daily_threshold:
                entry.regular_hours = daily_threshold
                entry.overtime_hours = round(hours - daily_threshold, 2)
            else:
                entry.regular_hours = round(hours, 2)
                entry.overtime_hours = 0

        entry.save()
        AuditLog.objects.create(
            actor=employee, target_employee=employee,
            action='clock_out', model_name='TimeEntry',
            object_id=str(entry.id),
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response(TimeEntrySerializer(entry).data)

    @action(detail=False, methods=['get'], url_path='current-status')
    def current_status(self, request):
        employee = request.user.employee_profile
        try:
            entry = TimeEntry.objects.get(employee=employee, clock_out__isnull=True)
            active_break = entry.breaks.filter(end_time__isnull=True).first()
            return Response({
                'clocked_in': True,
                'entry': TimeEntrySerializer(entry).data,
                'on_break': active_break is not None,
                'break': BreakSerializer(active_break).data if active_break else None,
            })
        except TimeEntry.DoesNotExist:
            return Response({'clocked_in': False, 'entry': None, 'on_break': False})

    @action(detail=False, methods=['get'], url_path='today-summary')
    def today_summary(self, request):
        employee = request.user.employee_profile
        today = timezone.now().date()
        entries = TimeEntry.objects.filter(employee=employee, clock_in__date=today)
        total_regular = sum(e.regular_hours for e in entries)
        total_ot = sum(e.overtime_hours for e in entries)
        return Response({
            'date': today,
            'total_regular_hours': total_regular,
            'total_overtime_hours': total_ot,
            'entries': TimeEntrySerializer(entries, many=True).data,
        })


class BreakViewSet(viewsets.ModelViewSet):
    serializer_class = BreakSerializer

    def get_queryset(self):
        employee = self.request.user.employee_profile
        return Break.objects.filter(time_entry__employee=employee)

    @action(detail=False, methods=['post'], url_path='start')
    def start_break(self, request):
        employee = request.user.employee_profile
        try:
            entry = TimeEntry.objects.get(employee=employee, clock_out__isnull=True)
        except TimeEntry.DoesNotExist:
            return Response({'error': 'You must be clocked in to start a break.'}, status=400)

        if entry.breaks.filter(end_time__isnull=True).exists():
            return Response({'error': 'You already have an active break.'}, status=400)

        break_obj = Break.objects.create(
            time_entry=entry,
            start_time=timezone.now(),
            break_type=request.data.get('break_type', 'rest'),
        )
        AuditLog.objects.create(
            actor=employee, target_employee=employee,
            action='break_start', model_name='Break',
            object_id=str(break_obj.id),
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response(BreakSerializer(break_obj).data, status=201)

    @action(detail=False, methods=['post'], url_path='end')
    def end_break(self, request):
        employee = request.user.employee_profile
        try:
            entry = TimeEntry.objects.get(employee=employee, clock_out__isnull=True)
            break_obj = entry.breaks.get(end_time__isnull=True)
        except (TimeEntry.DoesNotExist, Break.DoesNotExist):
            return Response({'error': 'No active break found.'}, status=400)

        break_obj.end_time = timezone.now()
        break_obj.save()

        total_break_mins = sum(
            b.duration_minutes for b in entry.breaks.all() if b.duration_minutes
        )
        entry.total_break_minutes = total_break_mins
        entry.save()

        AuditLog.objects.create(
            actor=employee, target_employee=employee,
            action='break_end', model_name='Break',
            object_id=str(break_obj.id),
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response(BreakSerializer(break_obj).data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    filterset_fields = ['action', 'model_name']
    ordering_fields = ['timestamp']

    def get_queryset(self):
        employee = self.request.user.employee_profile
        if employee.role == 'admin':
            return AuditLog.objects.select_related('actor__user', 'target_employee__user').all()
        return AuditLog.objects.filter(target_employee=employee)
