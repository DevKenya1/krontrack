from django.contrib import admin
from .models import TimeEntry, Break, AuditLog


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ['employee', 'clock_in', 'clock_out', 'status', 'regular_hours']
    list_filter = ['status', 'clock_in_method']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']


@admin.register(Break)
class BreakAdmin(admin.ModelAdmin):
    list_display = ['time_entry', 'break_type', 'start_time', 'end_time']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['actor', 'action', 'model_name', 'timestamp']
    list_filter = ['action']
