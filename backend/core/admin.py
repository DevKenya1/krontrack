from django.contrib import admin
from .models import Employee, Department, Shift


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'manager', 'created_at']
    search_fields = ['name']


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_time', 'end_time']
    search_fields = ['name']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'full_name', 'department', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'department']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'user__email']
    raw_id_fields = ['user']
