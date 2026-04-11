from rest_framework import serializers
from django.utils import timezone
from .models import TimeEntry, Break, AuditLog
from core.serializers import EmployeeSerializer


class BreakSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Break
        fields = ['id', 'time_entry', 'break_type', 'start_time',
                  'end_time', 'is_paid', 'notes', 'duration_minutes', 'is_active']
        read_only_fields = ['id']


class TimeEntrySerializer(serializers.ModelSerializer):
    breaks = BreakSerializer(many=True, read_only=True)
    duration_hours = serializers.FloatField(read_only=True)
    is_clocked_in = serializers.BooleanField(read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = TimeEntry
        fields = [
            'id', 'employee', 'employee_name', 'clock_in', 'clock_out',
            'clock_in_method', 'clock_out_method',
            'clock_in_lat', 'clock_in_lng', 'clock_out_lat', 'clock_out_lng',
            'is_within_geofence', 'regular_hours', 'overtime_hours',
            'total_break_minutes', 'status', 'notes',
            'edited_by', 'edited_at', 'edit_reason',
            'duration_hours', 'is_clocked_in', 'breaks', 'created_at',
        ]
        read_only_fields = ['id', 'regular_hours', 'overtime_hours', 'created_at']


class ClockInSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=TimeEntry.CLOCK_METHOD, default='web')
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        from .models import TimeEntry
        employee = self.context['request'].user.employee_profile
        active = TimeEntry.objects.filter(
            employee=employee,
            clock_out__isnull=True
        ).exists()
        if active:
            raise serializers.ValidationError('You are already clocked in.')
        return data


class ClockOutSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=TimeEntry.CLOCK_METHOD, default='web')
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.full_name', read_only=True)
    target_name = serializers.CharField(source='target_employee.full_name', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'actor_name', 'target_employee', 'target_name',
                  'action', 'model_name', 'object_id', 'before_data',
                  'after_data', 'ip_address', 'timestamp']
        read_only_fields = fields
