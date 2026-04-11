import uuid
from django.db import models
from django.utils import timezone
from core.models import Employee


class TimeEntry(models.Model):
    CLOCK_METHOD = [
        ('web', 'Web'),
        ('mobile', 'Mobile'),
        ('pin', 'PIN Kiosk'),
        ('qr', 'QR Code'),
        ('manager', 'Manager Entry'),
        ('api', 'API'),
    ]
    STATUS = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('missed_out', 'Missed Clock-Out'),
        ('edited', 'Edited'),
        ('pending_review', 'Pending Review'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='time_entries')
    clock_in = models.DateTimeField()
    clock_out = models.DateTimeField(null=True, blank=True)
    clock_in_method = models.CharField(max_length=20, choices=CLOCK_METHOD, default='web')
    clock_out_method = models.CharField(max_length=20, choices=CLOCK_METHOD, null=True, blank=True)
    clock_in_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clock_in_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clock_out_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clock_out_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_within_geofence = models.BooleanField(null=True, blank=True)
    regular_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_break_minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS, default='active')
    notes = models.TextField(blank=True)
    edited_by = models.ForeignKey(
        Employee, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='edited_entries'
    )
    edited_at = models.DateTimeField(null=True, blank=True)
    edit_reason = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-clock_in']
        verbose_name_plural = 'Time Entries'

    def __str__(self):
        return f"{self.employee} - {self.clock_in.date()}"

    @property
    def duration_hours(self):
        if self.clock_out:
            delta = self.clock_out - self.clock_in
            break_hours = self.total_break_minutes / 60
            return round(delta.total_seconds() / 3600 - break_hours, 2)
        return None

    @property
    def is_clocked_in(self):
        return self.clock_out is None


class Break(models.Model):
    BREAK_TYPE = [
        ('meal', 'Meal Break'),
        ('rest', 'Rest Break'),
        ('personal', 'Personal'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    time_entry = models.ForeignKey(TimeEntry, on_delete=models.CASCADE, related_name='breaks')
    break_type = models.CharField(max_length=20, choices=BREAK_TYPE, default='rest')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"{self.time_entry.employee} break at {self.start_time}"

    @property
    def duration_minutes(self):
        if self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        return None

    @property
    def is_active(self):
        return self.end_time is None


class AuditLog(models.Model):
    ACTION = [
        ('clock_in', 'Clock In'),
        ('clock_out', 'Clock Out'),
        ('break_start', 'Break Start'),
        ('break_end', 'Break End'),
        ('edit', 'Edit'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('delete', 'Delete'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    target_employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='audit_records')
    action = models.CharField(max_length=20, choices=ACTION)
    model_name = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50)
    before_data = models.JSONField(null=True, blank=True)
    after_data = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.actor} - {self.action} at {self.timestamp}"
