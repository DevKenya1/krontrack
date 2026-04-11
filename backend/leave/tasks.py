from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(name='leave.tasks.accrue_pto_balances')
def accrue_pto_balances():
    from .models import PTOAccrual, PTOPolicy
    from core.models import Employee

    today = timezone.now().date()
    employees = Employee.objects.filter(is_active=True)
    policies = PTOPolicy.objects.filter(is_active=True)

    count = 0
    for emp in employees:
        days_employed = (today - emp.date_hired).days if emp.date_hired else 0

        for policy in policies:
            if days_employed < policy.waiting_period_days:
                continue

            last = PTOAccrual.objects.filter(
                employee=emp, leave_type=policy.leave_type
            ).order_by('-as_of_date').first()

            current_balance = last.balance_hours if last else 0

            if policy.max_balance_hours and current_balance >= policy.max_balance_hours:
                continue

            new_balance = current_balance + float(policy.accrual_rate_hours)
            if policy.max_balance_hours:
                new_balance = min(new_balance, float(policy.max_balance_hours))

            PTOAccrual.objects.create(
                employee=emp,
                leave_type=policy.leave_type,
                balance_hours=new_balance,
                accrued_this_period=policy.accrual_rate_hours,
                used_this_period=0,
                as_of_date=today,
            )
            count += 1

    logger.info(f'PTO accrual complete: {count} records created')
    return f'{count} PTO accrual records created'


@shared_task(name='leave.tasks.update_pto_on_approval')
def update_pto_on_approval(pto_request_id: str):
    from .models import PTORequest, PTOAccrual

    try:
        request = PTORequest.objects.get(id=pto_request_id)
        if request.status != 'approved':
            return

        last = PTOAccrual.objects.filter(
            employee=request.employee,
            leave_type=request.leave_type,
        ).order_by('-as_of_date').first()

        if last:
            from django.utils import timezone
            PTOAccrual.objects.create(
                employee=request.employee,
                leave_type=request.leave_type,
                balance_hours=max(0, float(last.balance_hours) - float(request.total_hours)),
                accrued_this_period=0,
                used_this_period=request.total_hours,
                as_of_date=timezone.now().date(),
            )
            logger.info(f'PTO balance updated for {request.employee} after approval')
    except PTORequest.DoesNotExist:
        logger.error(f'PTORequest {pto_request_id} not found')
