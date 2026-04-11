import uuid
from django.db import models
from core.models import Employee


class Notification(models.Model):
    TYPE = [
        ('missed_punch', 'Missed Punch'),
        ('timesheet_submitted', 'Timesheet Submitted'),
        ('timesheet_approved', 'Timesheet Approved'),
        ('timesheet_rejected', 'Timesheet Rejected'),
        ('pto_approved', 'PTO Approved'),
        ('pto_rejected', 'PTO Rejected'),
        ('pto_request', 'PTO Request'),
        ('overtime_alert', 'Overtime Alert'),
        ('shift_reminder', 'Shift Reminder'),
        ('system', 'System'),
    ]
    CHANNEL = [
        ('in_app', 'In App'),
        ('email', 'Email'),
        ('push', 'Push'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE)
    channel = models.CharField(max_length=10, choices=CHANNEL, default='in_app')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    action_url = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient} - {self.notification_type}"
