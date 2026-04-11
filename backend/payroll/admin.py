from django.contrib import admin
from .models import PayrollReport, PayrollEntry


@admin.register(PayrollReport)
class PayrollReportAdmin(admin.ModelAdmin):
    list_display = ['name', 'period_start', 'period_end', 'status', 'total_employees']


@admin.register(PayrollEntry)
class PayrollEntryAdmin(admin.ModelAdmin):
    list_display = ['employee', 'report', 'regular_hours', 'overtime_hours', 'gross_pay']
