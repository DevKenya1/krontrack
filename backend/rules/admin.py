from django.contrib import admin
from .models import OvertimeRule, BreakPolicy


@admin.register(OvertimeRule)
class OvertimeRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'daily_threshold_hours', 'overtime_multiplier', 'is_active']


@admin.register(BreakPolicy)
class BreakPolicyAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'break_duration_minutes', 'is_paid', 'is_active']
