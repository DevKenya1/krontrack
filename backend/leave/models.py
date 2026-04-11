import uuid
from django.db import models
from core.models import Employee


class PTORequest(models.Model):
    LEAVE_TYPE = [
        ('vacation', 'Vacation'),
        ('sick', 'Sick Leave'),
        ('personal', 'Personal'),
        ('bereavement', 'Bereavement'),
        ('unpaid', 'Unpaid Leave'),
        ('other', 'Other'),
    ]
    STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='pto_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE)
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.DecimalField(max_digits=5, decimal_places=1)
    total_hours = models.DecimalField(max_digits=6, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    reviewed_by = models.ForeignKey(
        Employee, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_pto_requests'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.start_date} to {self.end_date})"


class PTOAccrual(models.Model):
    LEAVE_TYPE = [
        ('vacation', 'Vacation'),
        ('sick', 'Sick Leave'),
        ('personal', 'Personal'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='pto_accruals')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE)
    balance_hours = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    accrued_this_period = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    used_this_period = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    carry_over_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    as_of_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-as_of_date']
        unique_together = ['employee', 'leave_type', 'as_of_date']

    def __str__(self):
        return f"{self.employee} - {self.leave_type} balance: {self.balance_hours}h"


class PTOPolicy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    leave_type = models.CharField(max_length=20, choices=PTOAccrual.LEAVE_TYPE)
    accrual_rate_hours = models.DecimalField(max_digits=5, decimal_places=2, help_text='Hours accrued per period')
    accrual_period = models.CharField(max_length=20, choices=[('weekly','Weekly'),('biweekly','Bi-weekly'),('monthly','Monthly')], default='biweekly')
    max_balance_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    max_carry_over_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    waiting_period_days = models.PositiveIntegerField(default=0, help_text='Days before accrual starts')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'PTO Policies'

    def __str__(self):
        return f"{self.name} - {self.accrual_rate_hours}h/{self.accrual_period}"
