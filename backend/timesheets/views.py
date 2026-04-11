from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Timesheet, TimesheetApproval
from .serializers import TimesheetSerializer, TimesheetSummarySerializer, TimesheetApprovalSerializer


class TimesheetViewSet(viewsets.ModelViewSet):
    serializer_class = TimesheetSerializer
    filterset_fields = ['status', 'employee']
    ordering_fields = ['period_start', 'period_end', 'created_at']

    def get_queryset(self):
        employee = self.request.user.employee_profile
        if employee.role in ('admin', 'hr'):
            return Timesheet.objects.select_related('employee__user').all()
        if employee.role == 'manager':
            return Timesheet.objects.filter(
                employee__in=employee.direct_reports.all()
            ) | Timesheet.objects.filter(employee=employee)
        return Timesheet.objects.filter(employee=employee)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        timesheet = self.get_object()
        if timesheet.status not in ('draft',):
            return Response({'error': 'Only draft timesheets can be submitted.'}, status=400)
        timesheet.status = 'submitted'
        timesheet.submitted_at = timezone.now()
        timesheet.save()
        return Response(TimesheetSerializer(timesheet).data)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        timesheet = self.get_object()
        approver = request.user.employee_profile
        if approver.role not in ('manager', 'admin', 'hr'):
            return Response({'error': 'Only managers, HR or admins can approve timesheets.'}, status=403)
        if timesheet.status != 'submitted':
            return Response({'error': 'Only submitted timesheets can be approved.'}, status=400)
        timesheet.status = 'approved'
        timesheet.save()
        TimesheetApproval.objects.create(
            timesheet=timesheet, approver=approver,
            action='approve', notes=request.data.get('notes', '')
        )
        return Response(TimesheetSerializer(timesheet).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        timesheet = self.get_object()
        approver = request.user.employee_profile
        if approver.role not in ('manager', 'admin', 'hr'):
            return Response({'error': 'Only managers, HR or admins can reject timesheets.'}, status=403)
        timesheet.status = 'rejected'
        timesheet.save()
        TimesheetApproval.objects.create(
            timesheet=timesheet, approver=approver,
            action='reject', notes=request.data.get('notes', '')
        )
        return Response(TimesheetSerializer(timesheet).data)

    @action(detail=True, methods=['post'], url_path='lock')
    def lock(self, request, pk=None):
        timesheet = self.get_object()
        approver = request.user.employee_profile
        if approver.role not in ('admin', 'hr'):
            return Response({'error': 'Only admins can lock timesheets.'}, status=403)
        timesheet.status = 'locked'
        timesheet.locked_at = timezone.now()
        timesheet.locked_by = approver
        timesheet.save()
        return Response(TimesheetSerializer(timesheet).data)

    @action(detail=False, methods=['get'], url_path='pending-approvals')
    def pending_approvals(self, request):
        employee = request.user.employee_profile
        if not employee.is_manager:
            return Response({'error': 'Not authorized.'}, status=403)
        qs = Timesheet.objects.filter(
            status='submitted',
            employee__in=employee.direct_reports.all()
        )
        serializer = TimesheetSummarySerializer(qs, many=True)
        return Response(serializer.data)
