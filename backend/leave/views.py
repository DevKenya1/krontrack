from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PTORequest, PTOAccrual, PTOPolicy
from .serializers import PTORequestSerializer, PTOAccrualSerializer, PTOPolicySerializer, PTOReviewSerializer


class PTOPolicyViewSet(viewsets.ModelViewSet):
    queryset = PTOPolicy.objects.filter(is_active=True)
    serializer_class = PTOPolicySerializer


class PTORequestViewSet(viewsets.ModelViewSet):
    serializer_class = PTORequestSerializer
    filterset_fields = ['status', 'leave_type']
    ordering_fields = ['start_date', 'created_at']

    def get_queryset(self):
        employee = self.request.user.employee_profile
        if employee.role in ('admin', 'hr'):
            return PTORequest.objects.select_related('employee__user').all()
        if employee.role == 'manager':
            return PTORequest.objects.filter(
                employee__in=employee.direct_reports.all()
            ) | PTORequest.objects.filter(employee=employee)
        return PTORequest.objects.filter(employee=employee)

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user.employee_profile)

    @action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None):
        pto = self.get_object()
        reviewer = request.user.employee_profile
        if reviewer.role not in ('manager', 'admin', 'hr'):
            return Response({'error': 'Only managers, HR or admins can review PTO requests.'}, status=403)
        if pto.status != 'pending':
            return Response({'error': 'Only pending requests can be reviewed.'}, status=400)

        serializer = PTOReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pto.status = 'approved' if serializer.validated_data['action'] == 'approve' else 'rejected'
        pto.reviewed_by = reviewer
        pto.reviewed_at = timezone.now()
        pto.review_notes = serializer.validated_data.get('review_notes', '')
        pto.save()
        return Response(PTORequestSerializer(pto).data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        pto = self.get_object()
        if pto.status not in ('pending',):
            return Response({'error': 'Only pending requests can be cancelled.'}, status=400)
        pto.status = 'cancelled'
        pto.save()
        return Response(PTORequestSerializer(pto).data)


class PTOAccrualViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PTOAccrualSerializer

    def get_queryset(self):
        employee = self.request.user.employee_profile
        if employee.role == 'admin':
            return PTOAccrual.objects.select_related('employee__user').all()
        return PTOAccrual.objects.filter(employee=employee)

    @action(detail=False, methods=['get'], url_path='my-balances')
    def my_balances(self, request):
        employee = request.user.employee_profile
        balances = PTOAccrual.objects.filter(employee=employee).order_by('leave_type', '-as_of_date')
        seen = set()
        latest = []
        for b in balances:
            if b.leave_type not in seen:
                seen.add(b.leave_type)
                latest.append(b)
        return Response(PTOAccrualSerializer(latest, many=True).data)
