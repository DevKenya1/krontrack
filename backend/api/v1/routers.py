from rest_framework.routers import DefaultRouter
from core.views import EmployeeViewSet, DepartmentViewSet, ShiftViewSet
from attendance.views import TimeEntryViewSet, BreakViewSet, AuditLogViewSet
from timesheets.views import TimesheetViewSet
from leave.views import PTORequestViewSet, PTOAccrualViewSet, PTOPolicyViewSet
from payroll.views import PayrollReportViewSet
from rules.views import OvertimeRuleViewSet, BreakPolicyViewSet
from notifications.views import NotificationViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'time-entries', TimeEntryViewSet, basename='timeentry')
router.register(r'breaks', BreakViewSet, basename='break')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'timesheets', TimesheetViewSet, basename='timesheet')
router.register(r'pto-requests', PTORequestViewSet, basename='ptorequest')
router.register(r'pto-accruals', PTOAccrualViewSet, basename='ptoaccrual')
router.register(r'pto-policies', PTOPolicyViewSet, basename='ptopolicy')
router.register(r'payroll-reports', PayrollReportViewSet, basename='payrollreport')
router.register(r'overtime-rules', OvertimeRuleViewSet, basename='overtimerule')
router.register(r'break-policies', BreakPolicyViewSet, basename='breakpolicy')
router.register(r'notifications', NotificationViewSet, basename='notification')
