"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { User, LeaveRequest, LeaveBalance, AttendanceRecord, AttendanceSource } from "./types";
import { useSession } from "./SessionContext";
import { LEAVE_REQUESTS, LEAVE_BALANCES, ATTENDANCE_RECORDS } from "./mockData";

interface AppState {
  currentUser: User | null;
  users: User[];
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  attendanceRecords: AttendanceRecord[];
  clockedIn: boolean;
  clockInTime: string | null;
  // Actions
  applyLeave: (req: Omit<LeaveRequest, "id" | "appliedOn" | "status">) => void;
  reviewLeave: (id: string, status: "Approved" | "Rejected", note?: string) => void;
  clockIn: (source?: AttendanceSource) => void;
  clockOut: () => void;
  devicePunch: (source: AttendanceSource) => "clocked-in" | "clocked-out";
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = useSession();

  // All employees list — in production this would come from an API
  // For now seed from mockData but allow in-memory CRUD
  const [users, setUsers]                       = useState<User[]>([]);
  const [leaveRequests, setLeaveRequests]       = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [leaveBalances]                         = useState<LeaveBalance[]>(LEAVE_BALANCES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(ATTENDANCE_RECORDS);
  const [clockedIn, setClockedIn]               = useState(false);
  const [clockInTime, setClockInTime]           = useState<string | null>(null);

  // Seed users list lazily from import to avoid circular
  React.useEffect(() => {
    import("./mockData").then((m) => setUsers(m.USERS));
  }, []);

  const applyLeave = useCallback((req: Omit<LeaveRequest, "id" | "appliedOn" | "status">) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `lr${Date.now()}`,
      appliedOn: new Date().toISOString().slice(0, 10),
      status: "Pending",
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
  }, []);

  const reviewLeave = useCallback((id: string, status: "Approved" | "Rejected", note?: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, reviewedBy: currentUser?.name ?? "Admin", reviewNote: note }
          : r
      )
    );
  }, [currentUser]);

  const clockIn = useCallback((source: AttendanceSource = "manual") => {
    if (!currentUser) return;
    const now   = new Date().toTimeString().slice(0, 5);
    const today = new Date().toISOString().slice(0, 10);
    setClockedIn(true);
    setClockInTime(now);
    setAttendanceRecords((prev) => [
      {
        id: `a${Date.now()}`,
        employeeId:   currentUser.id,
        employeeName: currentUser.name,
        date: today,
        clockIn: now,
        status: "Present",
        source,
      },
      ...prev,
    ]);
  }, [currentUser]);

  const clockOut = useCallback(() => {
    if (!currentUser) return;
    const now   = new Date().toTimeString().slice(0, 5);
    const today = new Date().toISOString().slice(0, 10);
    setClockedIn(false);
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.employeeId === currentUser.id && r.date === today && !r.clockOut) {
          const [ih, im] = (r.clockIn ?? "09:00").split(":").map(Number);
          const [oh, om] = now.split(":").map(Number);
          const hrs = Math.round(((oh * 60 + om) - (ih * 60 + im)) / 60 * 100) / 100;
          return { ...r, clockOut: now, hoursWorked: hrs };
        }
        return r;
      })
    );
  }, [currentUser]);

  // Device punch: auto clock-in or clock-out based on current state
  const devicePunch = useCallback((source: AttendanceSource): "clocked-in" | "clocked-out" => {
    if (!currentUser) return "clocked-out";
    if (clockedIn) {
      const now   = new Date().toTimeString().slice(0, 5);
      const today = new Date().toISOString().slice(0, 10);
      setClockedIn(false);
      setAttendanceRecords((prev) =>
        prev.map((r) => {
          if (r.employeeId === currentUser.id && r.date === today && !r.clockOut) {
            const [ih, im] = (r.clockIn ?? "09:00").split(":").map(Number);
            const [oh, om] = now.split(":").map(Number);
            const hrs = Math.round(((oh * 60 + om) - (ih * 60 + im)) / 60 * 100) / 100;
            return { ...r, clockOut: now, hoursWorked: hrs };
          }
          return r;
        })
      );
      return "clocked-out";
    } else {
      const now   = new Date().toTimeString().slice(0, 5);
      const today = new Date().toISOString().slice(0, 10);
      setClockedIn(true);
      setClockInTime(now);
      setAttendanceRecords((prev) => [
        {
          id: `a${Date.now()}`,
          employeeId:   currentUser.id,
          employeeName: currentUser.name,
          date: today,
          clockIn: now,
          status: "Present",
          source,
        },
        ...prev,
      ]);
      return "clocked-in";
    }
  }, [currentUser, clockedIn]);

  const addUser = useCallback((u: Omit<User, "id">) => {
    setUsers((prev) => [...prev, { ...u, id: `u${Date.now()}` }]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      leaveRequests,
      leaveBalances,
      attendanceRecords,
      clockedIn,
      clockInTime,
      applyLeave,
      reviewLeave,
      clockIn,
      clockOut,
      devicePunch,
      addUser,
      updateUser,
      deleteUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
