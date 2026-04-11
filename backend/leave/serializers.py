from rest_framework import serializers
from .models import PTORequest, PTOAccrual, PTOPolicy


class PTOPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PTOPolicy
        fields = '__all__'


class PTOAccrualSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = PTOAccrual
        fields = ['id', 'employee', 'employee_name', 'leave_type',
                  'balance_hours', 'accrued_this_period', 'used_this_period',
                  'carry_over_hours', 'as_of_date', 'created_at']
        read_only_fields = fields


class PTORequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)

    class Meta:
        model = PTORequest
        fields = [
            'id', 'employee', 'employee_name', 'leave_type',
            'start_date', 'end_date', 'total_days', 'total_hours',
            'reason', 'status', 'reviewed_by', 'reviewed_by_name',
            'reviewed_at', 'review_notes', 'created_at',
        ]
        read_only_fields = ['id', 'employee', 'status', 'reviewed_by',
                            'reviewed_at', 'created_at']

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError('Start date must be before end date.')
        return data


class PTOReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    review_notes = serializers.CharField(required=False, allow_blank=True)
