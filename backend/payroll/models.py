import uuid
from django.db import models
from core.models import Employee, Department
from timesheets.models import Timesheet


class PayrollReport(models.Model):
    FORMAT = [
        ('csv', 'CSV'),
        ('pdf', 'PDF'),
        ('json', 'JSON'),
    ]
    STATUS = [
        ('generating', 'Generating'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    period_start = models.DateField()
    period_end = models.DateField()
    department = models.ForeignKey(
        Department, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='payroll_reports'
    )
    generated_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='generated_reports')
    format = models.CharField(max_length=10, choices=FORMAT, default='csv')
    status = models.CharField(max_length=20, choices=STATUS, default='generating')
    file = models.FileField(upload_to='payroll_reports/', null=True, blank=True)
    total_employees = models.PositiveIntegerField(default=0)
    total_regular_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_overtime_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_gross_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.period_start} to {self.period_end})"


class PayrollEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(PayrollReport, on_delete=models.CASCADE, related_name='entries')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_entries')
    timesheet = models.ForeignKey(Timesheet, null=True, blank=True, on_delete=models.SET_NULL, related_name='payroll_entries')
    regular_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    pto_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    overtime_rate = models.DecimalField(max_digits=8, decimal_places=2)
    regular_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overtime_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['employee__user__last_name']
        unique_together = ['report', 'employee']

    def __str__(self):
        return f"{self.employee} - {self.report.name} - "
