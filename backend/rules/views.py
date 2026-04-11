from rest_framework import viewsets
from .models import OvertimeRule, BreakPolicy
from .serializers import OvertimeRuleSerializer, BreakPolicySerializer


class OvertimeRuleViewSet(viewsets.ModelViewSet):
    queryset = OvertimeRule.objects.filter(is_active=True)
    serializer_class = OvertimeRuleSerializer
    filterset_fields = ['department', 'is_active']


class BreakPolicyViewSet(viewsets.ModelViewSet):
    queryset = BreakPolicy.objects.filter(is_active=True)
    serializer_class = BreakPolicySerializer
