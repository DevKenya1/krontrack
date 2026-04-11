#!/usr/bin/env python
import os
import sys
import django
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth.models import User
from core.models import Employee, Department, Shift
from rules.models import OvertimeRule, BreakPolicy
from leave.models import PTOPolicy

print("Seeding Krontrack demo data...")

# Departments
dept_names = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations']
depts = {}
for name in dept_names:
    d, _ = Department.objects.get_or_create(name=name)
    depts[name] = d
    print(f"  Department: {name}")

# Shifts
morning, _ = Shift.objects.get_or_create(
    name='Morning Shift',
    defaults={'start_time': '09:00', 'end_time': '17:00', 'schedule_days': ['MON','TUE','WED','THU','FRI'], 'grace_period_minutes': 10}
)
evening, _ = Shift.objects.get_or_create(
    name='Evening Shift',
    defaults={'start_time': '14:00', 'end_time': '22:00', 'schedule_days': ['MON','TUE','WED','THU','FRI'], 'grace_period_minutes': 10}
)
print(f"  Shifts: Morning, Evening")

# Employees
employees_data = [
    {'username': 'sarah.manager', 'first_name': 'Sarah', 'last_name': 'Johnson', 'role': 'manager', 'dept': 'Engineering', 'emp_id': 'EMP002'},
    {'username': 'john.dev', 'first_name': 'John', 'last_name': 'Smith', 'role': 'employee', 'dept': 'Engineering', 'emp_id': 'EMP003'},
    {'username': 'alice.hr', 'first_name': 'Alice', 'last_name': 'Brown', 'role': 'hr', 'dept': 'HR', 'emp_id': 'EMP004'},
    {'username': 'bob.fin', 'first_name': 'Bob', 'last_name': 'Davis', 'role': 'employee', 'dept': 'Finance', 'emp_id': 'EMP005'},
    {'username': 'carol.mkt', 'first_name': 'Carol', 'last_name': 'Wilson', 'role': 'employee', 'dept': 'Marketing', 'emp_id': 'EMP006'},
]

for edata in employees_data:
    user, created = User.objects.get_or_create(
        username=edata['username'],
        defaults={
            'email': f"{edata['username']}@krontrack.local",
            'first_name': edata['first_name'],
            'last_name': edata['last_name'],
        }
    )
    if created:
        user.set_password('password123')
        user.save()

    emp, _ = Employee.objects.get_or_create(
        user=user,
        defaults={
            'employee_id': edata['emp_id'],
            'department': depts[edata['dept']],
            'shift': morning,
            'role': edata['role'],
            'employment_type': 'full_time',
            'date_hired': date.today() - timedelta(days=365),
            'hourly_rate': 25.00,
            'is_active': True,
        }
    )
    print(f"  Employee: {edata['first_name']} {edata['last_name']} ({edata['role']})")

# Overtime rule
OvertimeRule.objects.get_or_create(
    name='Standard OT Rule',
    defaults={
        'daily_threshold_hours': 8,
        'weekly_threshold_hours': 40,
        'overtime_multiplier': 1.5,
        'is_active': True,
        'effective_from': date.today(),
    }
)
print("  Overtime rule: Standard (8h/day, 40h/week, 1.5x)")

# Break policy
BreakPolicy.objects.get_or_create(
    name='Standard Break Policy',
    defaults={
        'min_shift_hours_for_break': 4,
        'break_duration_minutes': 30,
        'is_paid': False,
        'max_breaks_per_shift': 2,
        'is_active': True,
    }
)
print("  Break policy: 30min unpaid after 4h")

# PTO Policies
for leave_type, rate in [('vacation', 1.54), ('sick', 0.77), ('personal', 0.38)]:
    PTOPolicy.objects.get_or_create(
        name=f'{leave_type.capitalize()} Policy',
        leave_type=leave_type,
        defaults={
            'accrual_rate_hours': rate,
            'accrual_period': 'weekly',
            'max_balance_hours': 160 if leave_type == 'vacation' else 80,
            'max_carry_over_hours': 40,
            'waiting_period_days': 90,
            'is_active': True,
        }
    )
    print(f"  PTO policy: {leave_type} ({rate}h/week)")

print("\nSeed data complete!")
print("\nDemo accounts:")
print("  Admin:    emmanueljesse / (your password)")
for e in employees_data:
    print(f"  {e['role'].capitalize()}: {e['username']} / password123")
