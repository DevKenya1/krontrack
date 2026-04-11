import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('krontrack')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'check-missed-punches-every-30min': {
        'task': 'attendance.tasks.check_missed_punches',
        'schedule': crontab(minute='*/30'),
    },
    'accrue-pto-every-monday': {
        'task': 'leave.tasks.accrue_pto_balances',
        'schedule': crontab(hour=0, minute=0, day_of_week='monday'),
    },
    'lock-payroll-periods-daily': {
        'task': 'timesheets.tasks.auto_lock_periods',
        'schedule': crontab(hour=1, minute=0),
    },
    'send-timesheet-reminders-friday': {
        'task': 'notifications.tasks.send_timesheet_reminders',
        'schedule': crontab(hour=8, minute=0, day_of_week='friday'),
    },
    'send-shift-reminders-daily': {
        'task': 'notifications.tasks.send_shift_reminders',
        'schedule': crontab(hour=7, minute=0),
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
