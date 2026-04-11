import uuid
from django.db import models
from core.models import Employee


class Timesheet(models.Model):
    STATUS = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('locked', 'Locked'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='timesheets')
    period_start = models.DateField()
    period_end = models.DateField()
    total_regular_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_break_minutes = models.PositiveIntegerField(default=0)
    total_pto_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey(
        Employee, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='locked_timesheets'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period_start']
        unique_together = ['employee', 'period_start', 'period_end']

    def __str__(self):
        return f"{self.employee} | {self.period_start} to {self.period_end}"

    @property
    def total_hours(self):
        return self.total_regular_hours + self.total_overtime_hours

    @property
    def is_editable(self):
        return self.status not in ('locked', 'approved')


class TimesheetApproval(models.Model):
    ACTION = [
        ('approve', 'Approved'),
        ('reject', 'Rejected'),
        ('request_changes', 'Changes Requested'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timesheet = models.ForeignKey(Timesheet, on_delete=models.CASCADE, related_name='approvals')
    approver = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='approval_actions')
    action = models.CharField(max_length=20, choices=ACTION)
    notes = models.TextField(blank=True)
    decided_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-decided_at']

    def __str__(self):
        return f"{self.approver} {self.action} {self.timesheet}"
