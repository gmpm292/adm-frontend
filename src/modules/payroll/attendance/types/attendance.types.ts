// attendance/types/attendance.types.ts
export interface Attendance {
  id: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  hoursWorked: number;
  isPaid: boolean;
  isHoliday: boolean;
  notes?: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  worker: Worker;
  workSchedule?: WorkSchedule;
  business?: Business;
  office?: Office;
  department?: Department;
  team?: Team;
  createdBy?: User;
  updatedBy?: User;
  deletedBy?: User;
}

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "early_departure"
  | "vacation"
  | "sick_leave";

export interface Worker {
  id: number;
  fullName: string;
  position: string;
  employeeId?: string;
  department?: Department;
  office?: Office;
}

export interface WorkSchedule {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  workingDays: any; // JSON object
}

export interface Business {
  id: number;
  name: string;
}

export interface Office {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullName: string;
}

export interface CreateAttendanceInput {
  businessId?: number;
  officeId?: number;
  departmentId?: number;
  teamId?: number;
  workerId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
  hoursWorked?: number;
  workScheduleId?: number;
  notes?: string;
  isHoliday?: boolean;
}

export interface UpdateAttendanceInput {
  id: number;
  businessId?: number;
  officeId?: number;
  departmentId?: number;
  teamId?: number;
  workerId?: number;
  attendanceDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
  hoursWorked?: number;
  isPaid?: boolean;
  workScheduleId?: number;
  notes?: string;
  isHoliday?: boolean;
}

export interface CheckInInput {
  workerId: number;
  time?: string;
  notes?: string;
}

export interface CheckOutInput {
  workerId: number;
  time?: string;
  notes?: string;
}
