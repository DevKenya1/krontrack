from celery import shared_task
from django.utils import timezone
from datetime import timedelta, date
import logging

logger = logging.getLogger(__name__)


@shared_task(name='timesheets.tasks.auto_lock_periods')
def auto_lock_periods():
    from .models import Timesheet
    from core.models import Employee
    from django.conf import settings

    lock_day = settings.KRONTRACK_SETTINGS.get('PAYROLL_LOCK_DAY', 5)
    today = timezone.now().date()

    if today.day != lock_day:
        return 'Not lock day'

    last_month_end = date(today.year, today.month, 1) - timedelta(days=1)
    last_month_start = date(last_month_end.year, last_month_end.month, 1)

    approved = Timesheet.objects.filter(
        status='approved',
        period_start__gte=last_month_start,
        period_end__lte=last_month_end,
    )

    count = approved.count()
    approved.update(
        status='locked',
        locked_at=timezone.now(),
    )

    logger.info(f'Auto-locked {count} timesheets for period {last_month_start} to {last_month_end}')
    return f'{count} timesheets locked'


@shared_task(name='timesheets.tasks.generate_timesheets')
def generate_timesheets_for_period(period_start: str, period_end: str):
    from .models import Timesheet
    from core.models import Employee
    from attendance.models import TimeEntry
    from django.db.models import Sum

    employees = Employee.objects.filter(is_active=True)
    created = 0

    for emp in employees:
        ts, new = Timesheet.objects.get_or_create(
            employee=emp,
            period_start=period_start,
            period_end=period_end,
            defaults={'status': 'draft'},
        )
        if new:
            entries = TimeEntry.objects.filter(
                employee=emp,
                clock_in__date__gte=period_start,
                clock_in__date__lte=period_end,
                status='completed',
            )
            totals = entries.aggregate(
                regular=Sum('regular_hours'),
                overtime=Sum('overtime_hours'),
                breaks=Sum('total_break_minutes'),
            )
            ts.total_regular_hours = totals['regular'] or 0
            ts.total_overtime_hours = totals['overtime'] or 0
            ts.total_break_minutes = totals['breaks'] or 0
            ts.save()
            created += 1

    logger.info(f'Generated {created} timesheets for {period_start} to {period_end}')
    return f'{created} timesheets generated'
