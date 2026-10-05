import { AuthUser } from "./authTypes";
import { User, LeaveRequest, LeaveBalance, AttendanceRecord, Device } from "./types";

// ─── Seed password for ALL users: Password1!
// Generated with bcrypt cost 12. Change per-user passwords in production.
const SEED_HASH = "$2b$12$85x9iva9zyUyyquBiuE1r.8NvF7FRAGeq7j3YTAiY8xrZt40241l2";

// ─── Auth Users (includes passwordHash — server-side only) ───────────────────
export const AUTH_USERS: AuthUser[] = [
  {
    id: "u1",
    name: "Alice Johnson",
    email: "alice@acme.com",
    role: "admin",
    department: "Engineering",
    position: "Engineering Manager",
    avatar: "AJ",
    passwordHash: SEED_HASH,
    isActive: true,
  },
  {
    id: "u2",
    name: "Bob Smith",
    email: "bob@acme.com",
    role: "employee",
    department: "Engineering",
    position: "Senior Developer",
    avatar: "BS",
    passwordHash: SEED_HASH,
    isActive: true,
  },
  {
    id: "u3",
    name: "Carol White",
    email: "carol@acme.com",
    role: "employee",
    department: "Design",
    position: "UI/UX Designer",
    avatar: "CW",
    passwordHash: SEED_HASH,
    isActive: true,
  },
  {
    id: "u4",
    name: "David Brown",
    email: "david@acme.com",
    role: "employee",
    department: "Marketing",
    position: "Marketing Specialist",
    avatar: "DB",
    passwordHash: SEED_HASH,
    isActive: true,
  },
  {
    id: "u5",
    name: "Eva Martinez",
    email: "eva@acme.com",
    role: "employee",
    department: "HR",
    position: "HR Coordinator",
    avatar: "EM",
    passwordHash: SEED_HASH,
    isActive: true,
  },
];

// ─── Public user profiles (no password) — for client-safe use ────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const USERS: User[] = AUTH_USERS.map(({ passwordHash: _passwordHash, isActive: _isActive, ...u }) => ({
  ...u,
  joinDate: u.id === "u1" ? "2020-01-15"
          : u.id === "u2" ? "2021-03-10"
          : u.id === "u3" ? "2021-07-22"
          : u.id === "u4" ? "2022-02-14"
          : "2022-11-01",
}));

// ─── Leave Requests ───────────────────────────────────────────────────────────
export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "lr1",
    employeeId: "u2",
    employeeName: "Bob Smith",
    department: "Engineering",
    leaveType: "Annual",
    startDate: "2024-08-05",
    endDate: "2024-08-09",
    days: 5,
    reason: "Family vacation",
    status: "Pending",
    appliedOn: "2024-07-20",
  },
  {
    id: "lr2",
    employeeId: "u3",
    employeeName: "Carol White",
    department: "Design",
    leaveType: "Sick",
    startDate: "2024-07-15",
    endDate: "2024-07-16",
    days: 2,
    reason: "Flu and fever",
    status: "Approved",
    appliedOn: "2024-07-15",
    reviewedBy: "Alice Johnson",
    reviewNote: "Get well soon!",
  },
  {
    id: "lr3",
    employeeId: "u4",
    employeeName: "David Brown",
    department: "Marketing",
    leaveType: "Casual",
    startDate: "2024-07-22",
    endDate: "2024-07-22",
    days: 1,
    reason: "Personal work",
    status: "Rejected",
    appliedOn: "2024-07-19",
    reviewedBy: "Alice Johnson",
    reviewNote: "Critical campaign week",
  },
  {
    id: "lr4",
    employeeId: "u5",
    employeeName: "Eva Martinez",
    department: "HR",
    leaveType: "Annual",
    startDate: "2024-08-12",
    endDate: "2024-08-16",
    days: 5,
    reason: "Wedding anniversary trip",
    status: "Pending",
    appliedOn: "2024-07-25",
  },
  {
    id: "lr5",
    employeeId: "u2",
    employeeName: "Bob Smith",
    department: "Engineering",
    leaveType: "Casual",
    startDate: "2024-07-10",
    endDate: "2024-07-10",
    days: 1,
    reason: "House moving",
    status: "Approved",
    appliedOn: "2024-07-08",
    reviewedBy: "Alice Johnson",
  },
];

// ─── Leave Balances ───────────────────────────────────────────────────────────
export const LEAVE_BALANCES: LeaveBalance[] = [
  { employeeId: "u2", annual: 20, sick: 10, casual: 6, used: { annual: 1, sick: 0, casual: 1 } },
  { employeeId: "u3", annual: 20, sick: 10, casual: 6, used: { annual: 0, sick: 2, casual: 0 } },
  { employeeId: "u4", annual: 20, sick: 10, casual: 6, used: { annual: 0, sick: 0, casual: 0 } },
  { employeeId: "u5", annual: 20, sick: 10, casual: 6, used: { annual: 0, sick: 0, casual: 0 } },
];

// ─── Attendance ───────────────────────────────────────────────────────────────
export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: "a1",  employeeId: "u2", employeeName: "Bob Smith",    date: "2024-07-22", clockIn: "09:01", clockOut: "18:02", hoursWorked: 9.0,  status: "Present",  source: "hid_card"   },
  { id: "a2",  employeeId: "u2", employeeName: "Bob Smith",    date: "2024-07-23", clockIn: "09:15", clockOut: "18:00", hoursWorked: 8.75, status: "Present",  source: "fingerprint" },
  { id: "a3",  employeeId: "u2", employeeName: "Bob Smith",    date: "2024-07-24", status: "Absent" },
  { id: "a4",  employeeId: "u3", employeeName: "Carol White",  date: "2024-07-22", clockIn: "08:50", clockOut: "17:30", hoursWorked: 8.67, status: "Present",  source: "face_scan"  },
  { id: "a5",  employeeId: "u3", employeeName: "Carol White",  date: "2024-07-23", clockIn: "09:00", clockOut: "13:00", hoursWorked: 4.0,  status: "Half Day", source: "manual"     },
  { id: "a6",  employeeId: "u4", employeeName: "David Brown",  date: "2024-07-22", clockIn: "09:05", clockOut: "18:10", hoursWorked: 9.08, status: "Present",  source: "hid_card"   },
  { id: "a7",  employeeId: "u4", employeeName: "David Brown",  date: "2024-07-23", status: "On Leave" },
  { id: "a8",  employeeId: "u5", employeeName: "Eva Martinez", date: "2024-07-22", clockIn: "08:45", clockOut: "17:45", hoursWorked: 9.0,  status: "Present",  source: "fingerprint" },
  { id: "a9",  employeeId: "u5", employeeName: "Eva Martinez", date: "2024-07-23", clockIn: "09:00", clockOut: "18:00", hoursWorked: 9.0,  status: "Present",  source: "face_scan"  },
  { id: "a10", employeeId: "u2", employeeName: "Bob Smith",    date: "2024-07-25", clockIn: "09:00", clockOut: "18:00", hoursWorked: 9.0,  status: "Present",  source: "manual"     },
];

// ─── Devices ──────────────────────────────────────────────────────────────────
export const DEVICES: Device[] = [
  { id: "d1", name: "Main Entrance",    type: "hid_card",    location: "Ground Floor", status: "online" },
  { id: "d2", name: "Lab Scanner",      type: "fingerprint", location: "3rd Floor",    status: "online" },
  { id: "d3", name: "HR Office",        type: "face_scan",   location: "2nd Floor",    status: "online" },
];
