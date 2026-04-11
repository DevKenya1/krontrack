from django.contrib import admin
from .models import PTORequest, PTOAccrual, PTOPolicy


@admin.register(PTORequest)
class PTORequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'leave_type']


@admin.register(PTOAccrual)
class PTOAccrualAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'balance_hours', 'as_of_date']


@admin.register(PTOPolicy)
class PTOPolicyAdmin(admin.ModelAdmin):
    list_display = ['name', 'leave_type', 'accrual_rate_hours', 'accrual_period', 'is_active']
