from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender='timesheets.TimesheetApproval')
def on_timesheet_approval(sender, instance, created, **kwargs):
    if not created:
        return

    from notifications.tasks import send_notification

    if instance.action == 'approve':
        send_notification.delay(
            str(instance.timesheet.employee.id),
            'timesheet_approved',
            'Timesheet Approved',
            f'Your timesheet for {instance.timesheet.period_start} to {instance.timesheet.period_end} has been approved.',
            '/timesheets',
        )
    elif instance.action == 'reject':
        send_notification.delay(
            str(instance.timesheet.employee.id),
            'timesheet_rejected',
            'Timesheet Rejected',
            f'Your timesheet for {instance.timesheet.period_start} to {instance.timesheet.period_end} was rejected. Notes: {instance.notes or "No notes provided."}',
            '/timesheets',
        )


@receiver(post_save, sender='leave.PTORequest')
def on_pto_status_change(sender, instance, created, **kwargs):
    if created:
        return

    from notifications.tasks import send_notification

    if instance.status == 'approved':
        send_notification.delay(
            str(instance.employee.id),
            'pto_approved',
            'Leave Request Approved',
            f'Your {instance.leave_type} leave from {instance.start_date} to {instance.end_date} has been approved.',
            '/leave',
        )

        from leave.tasks import update_pto_on_approval
        update_pto_on_approval.delay(str(instance.id))

    elif instance.status == 'rejected':
        send_notification.delay(
            str(instance.employee.id),
            'pto_rejected',
            'Leave Request Rejected',
            f'Your {instance.leave_type} leave request from {instance.start_date} to {instance.end_date} was not approved.',
            '/leave',
        )
