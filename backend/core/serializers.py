from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Employee, Department, Shift


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'manager', 'manager_name', 'employee_count', 'created_at']

    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'employee_id', 'full_name', 'email',
            'department', 'department_name', 'shift', 'shift_name',
            'manager', 'manager_name', 'role', 'employment_type',
            'phone', 'date_hired', 'hourly_rate', 'avatar',
            'is_active', 'timezone', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class EmployeeCreateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'password',
            'employee_id', 'department', 'shift', 'manager',
            'role', 'employment_type', 'phone', 'date_hired',
            'hourly_rate', 'timezone',
        ]

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        username = email.split('@')[0]
        base = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        employee = Employee.objects.create(user=user, **validated_data)
        return employee
