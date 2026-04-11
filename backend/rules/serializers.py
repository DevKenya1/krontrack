from rest_framework import serializers
from .models import OvertimeRule, BreakPolicy


class OvertimeRuleSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = OvertimeRule
        fields = '__all__'


class BreakPolicySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = BreakPolicy
        fields = '__all__'
