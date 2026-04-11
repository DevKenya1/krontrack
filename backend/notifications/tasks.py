from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(name='notifications.tasks.send_timesheet_reminders')
def send_timesheet_reminders():
    from .models import Notification
    from core.models import Employee
    from timesheets.models import Timesheet
    from datetime import date

    today = date.today()
    employees = Employee.objects.filter(is_active=True)
    count = 0

    for emp in employees:
        draft = Timesheet.objects.filter(
            employee=emp, status='draft'
        ).exists()

        if draft:
            Notification.objects.create(
                recipient=emp,
                notification_type='timesheet_submitted',
                channel='in_app',
                title='Timesheet Reminder',
                message='You have an unsubmitted timesheet. Please review and submit it for approval before the deadline.',
                action_url='/timesheets',
            )
            count += 1

    logger.info(f'Sent {count} timesheet reminders')
    return f'{count} reminders sent'


@shared_task(name='notifications.tasks.send_shift_reminders')
def send_shift_reminders():
    from .models import Notification
    from core.models import Employee
    from datetime import date

    today = date.today()
    day_name = today.strftime('%a').upper()[:3]

    employees = Employee.objects.filter(
        is_active=True,
        shift__isnull=False,
    ).select_related('shift')

    count = 0
    for emp in employees:
        if emp.shift and day_name in (emp.shift.schedule_days or []):
            Notification.objects.create(
                recipient=emp,
                notification_type='shift_reminder',
                channel='in_app',
                title='Shift Reminder',
                message=f'Your shift starts at {emp.shift.start_time.strftime("%I:%M %p")} today. Remember to clock in on time.',
                action_url='/dashboard',
            )
            count += 1

    logger.info(f'Sent {count} shift reminders')
    return f'{count} shift reminders sent'


@shared_task(name='notifications.tasks.send_notification')
def send_notification(recipient_id: str, notification_type: str,
                       title: str, message: str, action_url: str = ''):
    from .models import Notification
    from core.models import Employee

    try:
        employee = Employee.objects.get(id=recipient_id)
        Notification.objects.create(
            recipient=employee,
            notification_type=notification_type,
            channel='in_app',
            title=title,
            message=message,
            action_url=action_url,
        )
        logger.info(f'Notification sent to {employee}: {title}')
    except Employee.DoesNotExist:
        logger.error(f'Employee {recipient_id} not found')
