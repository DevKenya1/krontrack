from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class BaseHRAdapter(ABC):
    name = 'base'
    version = '1.0'

    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}

    def sync_employees(self):
        pass

    def on_employee_created(self, employee):
        pass

    def on_employee_updated(self, employee):
        pass

    def on_timesheet_approved(self, timesheet):
        pass

    def on_timesheet_locked(self, timesheet):
        pass

    def on_pto_approved(self, pto_request):
        pass

    def get_employee_mapping(self, external_id: str) -> Optional[str]:
        return None

    def push_payroll_data(self, payroll_report) -> bool:
        return False

    def validate_config(self) -> bool:
        return True

    def __str__(self):
        return f'{self.name} v{self.version}'


class WebhookAdapter(BaseHRAdapter):
    name = 'webhook'

    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.webhook_url = config.get('webhook_url', '') if config else ''
        self.secret = config.get('secret', '') if config else ''

    def _send(self, event: str, data: Dict[str, Any]):
        import requests
        import hashlib
        import hmac
        import json

        payload = json.dumps({'event': event, 'data': data})
        if self.secret:
            sig = hmac.new(
                self.secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            headers = {'X-Krontrack-Signature': sig, 'Content-Type': 'application/json'}
        else:
            headers = {'Content-Type': 'application/json'}

        try:
            resp = requests.post(self.webhook_url, data=payload, headers=headers, timeout=10)
            resp.raise_for_status()
            logger.info(f'Webhook sent: {event}')
            return True
        except Exception as e:
            logger.error(f'Webhook failed: {e}')
            return False

    def on_timesheet_approved(self, timesheet):
        self._send('timesheet.approved', {
            'timesheet_id': str(timesheet.id),
            'employee_id': str(timesheet.employee.employee_id),
            'period_start': str(timesheet.period_start),
            'period_end': str(timesheet.period_end),
            'total_hours': float(timesheet.total_regular_hours),
            'overtime_hours': float(timesheet.total_overtime_hours),
        })

    def on_pto_approved(self, pto_request):
        self._send('pto.approved', {
            'request_id': str(pto_request.id),
            'employee_id': str(pto_request.employee.employee_id),
            'leave_type': pto_request.leave_type,
            'start_date': str(pto_request.start_date),
            'end_date': str(pto_request.end_date),
            'total_days': float(pto_request.total_days),
        })
