// ─── Domain Types ────────────────────────────────────────────────────────────

export type Role = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  avatar: string;
  joinDate?: string;
}

export type LeaveType = "Annual" | "Sick" | "Casual" | "Unpaid" | "Maternity" | "Paternity";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;   // ISO date string
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  sick: number;
  casual: number;
  used: { annual: number; sick: number; casual: number };
}

export type AttendanceStatus = "Present" | "Absent" | "Half Day" | "On Leave";
export type AttendanceSource = "manual" | "hid_card" | "fingerprint" | "face_scan";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;       // ISO date string
  clockIn?: string;   // HH:mm
  clockOut?: string;
  hoursWorked?: number;
  status: AttendanceStatus;
  source?: AttendanceSource;
}

export interface ClockSession {
  clockedIn: boolean;
  clockInTime: string | null;
}

export interface Device {
  id: string;
  name: string;
  type: AttendanceSource;
  location: string;
  status: "online" | "offline";
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
