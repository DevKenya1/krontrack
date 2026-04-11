from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Employee, Department, Shift
from .serializers import (
    EmployeeSerializer, EmployeeCreateSerializer,
    DepartmentSerializer, ShiftSerializer
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    search_fields = ['name']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('user', 'department', 'shift', 'manager').all()
    serializer_class = EmployeeSerializer
    search_fields = ['user__first_name', 'user__last_name', 'employee_id', 'user__email']
    filterset_fields = ['department', 'role', 'is_active', 'employment_type']
    ordering_fields = ['user__last_name', 'date_hired', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeCreateSerializer
        return EmployeeSerializer

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        employee = request.user.employee_profile
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-team')
    def my_team(self, request):
        employee = request.user.employee_profile
        team = Employee.objects.filter(manager=employee, is_active=True)
        serializer = EmployeeSerializer(team, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        employee = self.get_object()
        employee.is_active = False
        employee.save()
        return Response({'status': 'Employee deactivated.'})


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def sso_providers(request):
    from django.conf import settings
    providers = []

    if getattr(settings, 'SOCIAL_AUTH_GOOGLE_OAUTH2_KEY', ''):
        providers.append({
            'id': 'google',
            'name': 'Google',
            'url': '/auth/social/login/google-oauth2/',
            'color': '#4285F4',
            'icon': 'G',
        })

    if getattr(settings, 'SOCIAL_AUTH_MICROSOFT_OAUTH2_KEY', ''):
        providers.append({
            'id': 'microsoft',
            'name': 'Microsoft',
            'url': '/auth/social/login/microsoft-oauth2/',
            'color': '#00A4EF',
            'icon': 'M',
        })

    custom = getattr(settings, 'KRONTRACK_SSO_PROVIDERS', [])
    providers.extend(custom)

    return Response({'providers': providers})
