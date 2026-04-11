import uuid
from django.db import models
from core.models import Department


class OvertimeRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    department = models.ForeignKey(
        Department, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='overtime_rules',
        help_text='Leave blank to apply globally'
    )
    daily_threshold_hours = models.DecimalField(max_digits=4, decimal_places=1, default=8.0)
    weekly_threshold_hours = models.DecimalField(max_digits=4, decimal_places=1, default=40.0)
    overtime_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.5)
    double_time_threshold_hours = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    double_time_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=2.0)
    is_active = models.BooleanField(default=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-effective_from']

    def __str__(self):
        scope = self.department.name if self.department else 'Global'
        return f"{self.name} ({scope}) - {self.overtime_multiplier}x after {self.daily_threshold_hours}h/day"


class BreakPolicy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    department = models.ForeignKey(
        Department, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='break_policies'
    )
    min_shift_hours_for_break = models.DecimalField(max_digits=4, decimal_places=1, default=4.0)
    break_duration_minutes = models.PositiveIntegerField(default=30)
    is_paid = models.BooleanField(default=False)
    max_breaks_per_shift = models.PositiveIntegerField(default=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Break Policies'

    def __str__(self):
        return f"{self.name} - {self.break_duration_minutes}min break"
