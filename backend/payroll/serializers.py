from rest_framework import serializers
from .models import PayrollReport, PayrollEntry


class PayrollEntrySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = PayrollEntry
        fields = [
            'id', 'employee', 'employee_name', 'employee_id', 'department',
            'regular_hours', 'overtime_hours', 'pto_hours',
            'hourly_rate', 'overtime_rate',
            'regular_pay', 'overtime_pay', 'gross_pay',
        ]
        read_only_fields = fields


class PayrollReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    entries = PayrollEntrySerializer(many=True, read_only=True)

    class Meta:
        model = PayrollReport
        fields = [
            'id', 'name', 'period_start', 'period_end',
            'department', 'department_name', 'generated_by',
            'generated_by_name', 'format', 'status', 'file',
            'total_employees', 'total_regular_hours',
            'total_overtime_hours', 'total_gross_pay',
            'entries', 'created_at',
        ]
        read_only_fields = ['id', 'generated_by', 'status', 'file',
                            'total_employees', 'total_regular_hours',
                            'total_overtime_hours', 'total_gross_pay', 'created_at']


class GenerateReportSerializer(serializers.Serializer):
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    department = serializers.UUIDField(required=False)
    format = serializers.ChoiceField(choices=['csv', 'pdf', 'json'], default='csv')
    name = serializers.CharField(max_length=200)

    def validate(self, data):
        if data['period_start'] > data['period_end']:
            raise serializers.ValidationError('Start date must be before end date.')
        return data
