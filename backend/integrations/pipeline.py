from core.models import Employee


def create_employee_profile(backend, user, response, *args, **kwargs):
    if not hasattr(user, 'employee_profile'):
        count = Employee.objects.count() + 1
        Employee.objects.get_or_create(
            user=user,
            defaults={
                'employee_id': f'SSO{count:04d}',
                'role': 'employee',
                'employment_type': 'full_time',
                'is_active': True,
                'timezone': 'UTC',
            }
        )
