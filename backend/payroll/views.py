from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PayrollReport
from .serializers import PayrollReportSerializer, GenerateReportSerializer


class PayrollReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayrollReportSerializer
    filterset_fields = ['status', 'format', 'department']
    ordering_fields = ['created_at', 'period_start']

    def get_queryset(self):
        employee = self.request.user.employee_profile
        if employee.role not in ('admin', 'hr', 'manager'):
            return PayrollReport.objects.none()
        return PayrollReport.objects.select_related('generated_by__user', 'department').all()

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        employee = request.user.employee_profile
        if employee.role not in ('admin', 'hr', 'manager'):
            return Response({'error': 'Not authorized to generate reports.'}, status=403)

        serializer = GenerateReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        report = PayrollReport.objects.create(
            name=data['name'],
            period_start=data['period_start'],
            period_end=data['period_end'],
            format=data['format'],
            generated_by=employee,
            status='generating',
        )
        return Response(PayrollReportSerializer(report).data, status=201)
