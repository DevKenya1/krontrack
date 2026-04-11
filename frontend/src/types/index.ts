export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface Department {
  id: string
  name: string
  manager: string | null
  manager_name: string | null
  employee_count: number
}

export interface Shift {
  id: string
  name: string
  start_time: string
  end_time: string
  schedule_days: string[]
  grace_period_minutes: number
  is_overnight: boolean
}

export interface Employee {
  id: string
  user: User
  employee_id: string
  full_name: string
  email: string
  department: string | null
  department_name: string | null
  shift: string | null
  shift_name: string | null
  manager: string | null
  manager_name: string | null
  role: 'employee' | 'manager' | 'admin' | 'hr'
  employment_type: string
  phone: string
  date_hired: string | null
  hourly_rate: string | null
  avatar: string | null
  is_active: boolean
  is_manager: boolean
  timezone: string
  created_at: string
}

export interface Break {
  id: string
  time_entry: string
  break_type: string
  start_time: string
  end_time: string | null
  is_paid: boolean
  notes: string
  duration_minutes: number | null
  is_active: boolean
}

export interface TimeEntry {
  id: string
  employee: string
  employee_name: string
  clock_in: string
  clock_out: string | null
  clock_in_method: string
  clock_out_method: string | null
  regular_hours: number
  overtime_hours: number
  total_break_minutes: number
  status: string
  notes: string
  duration_hours: number | null
  is_clocked_in: boolean
  breaks: Break[]
  created_at: string
}

export interface ClockStatus {
  clocked_in: boolean
  entry: TimeEntry | null
  on_break: boolean
  break: Break | null
}

export interface Timesheet {
  id: string
  employee: string
  employee_name: string
  department_name: string
  period_start: string
  period_end: string
  total_regular_hours: number
  total_overtime_hours: number
  total_break_minutes: number
  total_pto_hours: number
  total_hours: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'locked'
  submitted_at: string | null
  locked_at: string | null
  notes: string
  is_editable: boolean
  approvals: TimesheetApproval[]
  created_at: string
}

export interface TimesheetApproval {
  id: string
  timesheet: string
  approver: string
  approver_name: string
  action: string
  notes: string
  decided_at: string
}

export interface PTORequest {
  id: string
  employee: string
  employee_name: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  total_hours: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewed_by: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
  review_notes: string
  created_at: string
}

export interface PTOAccrual {
  id: string
  employee: string
  employee_name: string
  leave_type: string
  balance_hours: number
  accrued_this_period: number
  used_this_period: number
  carry_over_hours: number
  as_of_date: string
}

export interface Notification {
  id: string
  notification_type: string
  channel: string
  title: string
  message: string
  is_read: boolean
  read_at: string | null
  action_url: string
  created_at: string
}

export interface PayrollReport {
  id: string
  name: string
  period_start: string
  period_end: string
  department_name: string | null
  generated_by_name: string
  format: string
  status: string
  total_employees: number
  total_regular_hours: number
  total_overtime_hours: number
  total_gross_pay: number
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
