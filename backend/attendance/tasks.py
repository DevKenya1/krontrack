from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(name='attendance.tasks.check_missed_punches')
def check_missed_punches():
    from .models import TimeEntry
    from notifications.models import Notification
    from django.conf import settings

    threshold_hours = settings.KRONTRACK_SETTINGS.get('MISSED_PUNCH_ALERT_HOURS', 1)
    cutoff = timezone.now() - timedelta(hours=threshold_hours)

    missed = TimeEntry.objects.filter(
        clock_out__isnull=True,
        clock_in__lt=cutoff,
        status='active',
    ).select_related('employee__user')

    count = 0
    for entry in missed:
        already_notified = Notification.objects.filter(
            recipient=entry.employee,
            notification_type='missed_punch',
            metadata__entry_id=str(entry.id),
        ).exists()

        if not already_notified:
            entry.status = 'missed_out'
            entry.save(update_fields=['status'])

            Notification.objects.create(
                recipient=entry.employee,
                notification_type='missed_punch',
                channel='in_app',
                title='Missed Clock-Out',
                message=f'You forgot to clock out from your shift that started at {entry.clock_in.strftime("%I:%M %p")}. Please contact your manager.',
                action_url='/attendance',
                metadata={'entry_id': str(entry.id)},
            )
            count += 1
            logger.info(f'Missed punch alert sent to {entry.employee}')

    logger.info(f'Checked missed punches: {count} alerts sent')
    return f'{count} missed punch alerts sent'


@shared_task(name='attendance.tasks.calculate_hours')
def calculate_hours(entry_id: str):
    from .models import TimeEntry
    from django.conf import settings

    try:
        entry = TimeEntry.objects.get(id=entry_id)
        if not entry.clock_out:
            return

        ot_settings = settings.KRONTRACK_SETTINGS
        daily_threshold = ot_settings.get('DEFAULT_OVERTIME_DAILY_HOURS', 8)
        hours = entry.duration_hours or 0

        if hours > daily_threshold:
            entry.regular_hours = daily_threshold
            entry.overtime_hours = round(hours - daily_threshold, 2)
        else:
            entry.regular_hours = round(hours, 2)
            entry.overtime_hours = 0

        entry.save(update_fields=['regular_hours', 'overtime_hours'])
        logger.info(f'Hours calculated for entry {entry_id}')
    except TimeEntry.DoesNotExist:
        logger.error(f'TimeEntry {entry_id} not found')
