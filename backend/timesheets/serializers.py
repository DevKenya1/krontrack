from rest_framework import serializers
from .models import Timesheet, TimesheetApproval
from attendance.serializers import TimeEntrySerializer


class TimesheetApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.CharField(source='approver.full_name', read_only=True)

    class Meta:
        model = TimesheetApproval
        fields = ['id', 'timesheet', 'approver', 'approver_name',
                  'action', 'notes', 'decided_at']
        read_only_fields = ['id', 'approver', 'decided_at']


class TimesheetSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    total_hours = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)
    is_editable = serializers.BooleanField(read_only=True)
    approvals = TimesheetApprovalSerializer(many=True, read_only=True)
    entries = TimeEntrySerializer(many=True, read_only=True, source='employee.time_entries')

    class Meta:
        model = Timesheet
        fields = [
            'id', 'employee', 'employee_name', 'period_start', 'period_end',
            'total_regular_hours', 'total_overtime_hours', 'total_break_minutes',
            'total_pto_hours', 'total_hours', 'status', 'submitted_at',
            'locked_at', 'notes', 'is_editable', 'approvals', 'entries', 'created_at',
        ]
        read_only_fields = ['id', 'total_regular_hours', 'total_overtime_hours',
                            'submitted_at', 'locked_at', 'created_at']


class TimesheetSummarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)
    total_hours = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)

    class Meta:
        model = Timesheet
        fields = [
            'id', 'employee', 'employee_name', 'department_name',
            'period_start', 'period_end', 'total_regular_hours',
            'total_overtime_hours', 'total_hours', 'status',
        ]
