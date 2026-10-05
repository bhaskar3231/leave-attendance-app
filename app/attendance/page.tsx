"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Badge, attendanceVariant } from "@/components/Badge";
import Button from "@/components/Button";
import DeviceSimulator from "@/components/DeviceSimulator";
import { useApp } from "@/lib/AppContext";
import { LogIn, LogOut, Clock, CreditCard, Fingerprint, Smile, MousePointer } from "lucide-react";
import type { AttendanceSource } from "@/lib/types";

function SourceBadge({ source }: { source?: AttendanceSource }) {
  if (!source) return <span className="text-gray-400 text-xs">—</span>;

  const config: Record<AttendanceSource, { icon: React.ReactNode; label: string; cls: string }> = {
    hid_card:    { icon: <CreditCard   className="w-3 h-3" />, label: "HID Card",    cls: "bg-blue-50 text-blue-700 border-blue-200"     },
    fingerprint: { icon: <Fingerprint  className="w-3 h-3" />, label: "Fingerprint", cls: "bg-violet-50 text-violet-700 border-violet-200" },
    face_scan:   { icon: <Smile        className="w-3 h-3" />, label: "Face Scan",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    manual:      { icon: <MousePointer className="w-3 h-3" />, label: "Manual",      cls: "bg-gray-50 text-gray-700 border-gray-200"      },
  };
  const c = config[source];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${c.cls}`}
      data-testid={`source-badge-${source}`}>
      {c.icon} {c.label}
    </span>
  );
}

export default function AttendancePage() {
  const {
    currentUser,
    attendanceRecords,
    clockedIn,
    clockInTime,
    clockIn,
    clockOut,
  } = useApp();
  const [filterEmployee, setFilterEmployee] = useState("all");

  if (!currentUser) return null;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const records = attendanceRecords
    .filter((a) => {
      if (currentUser.role !== "admin") return a.employeeId === currentUser.id;
      if (filterEmployee !== "all") return a.employeeId === filterEmployee;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const todayRecord = attendanceRecords.find(
    (a) => a.employeeId === currentUser.id && a.date === todayStr
  );

  // Unique employees for admin filter
  const employeeSet = Array.from(
    new Map(attendanceRecords.map((a) => [a.employeeId, a.employeeName])).entries()
  );

  return (
    <AppShell title="Attendance">
      {/* Clock In / Out Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Clock className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-xl font-bold text-gray-800">{todayStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:ml-auto">
          {clockedIn && clockInTime && (
            <p className="text-sm text-gray-600">
              Clocked in at <span className="font-semibold text-emerald-700">{clockInTime}</span>
            </p>
          )}
          {todayRecord?.clockOut && (
            <p className="text-sm text-gray-600">
              Clocked out at <span className="font-semibold">{todayRecord.clockOut}</span>
              &nbsp;·&nbsp;<span className="font-semibold text-blue-700">{todayRecord.hoursWorked}h</span>
            </p>
          )}
          <Button
            variant={clockedIn ? "danger" : "success"}
            onClick={clockedIn ? clockOut : clockIn}
            disabled={!!todayRecord?.clockOut}
            data-testid={clockedIn ? "clock-out-btn" : "clock-in-btn"}
          >
            {clockedIn ? (
              <><LogOut className="w-4 h-4" /> Clock Out</>
            ) : (
              <><LogIn className="w-4 h-4" /> Clock In</>
            )}
          </Button>
        </div>
      </div>

      {/* Device Simulator */}
      <DeviceSimulator />

      {/* Admin filter */}
      {currentUser.role === "admin" && (
        <div className="mb-4">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            data-testid="attendance-employee-filter"
          >
            <option value="all">All Employees</option>
            {employeeSet.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Clock className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No attendance records found</p>
            <p className="text-xs text-gray-400 mt-1">Records will appear here once you clock in</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100" data-testid="attendance-table">
            <thead className="bg-gray-50">
              <tr>
                {["Employee", "Date", "Clock In", "Clock Out", "Hours", "Source", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors" data-testid={`attendance-row-${a.id}`}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-800">{a.employeeName}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{a.date}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{a.clockIn ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{a.clockOut ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{a.hoursWorked ?? "—"}</td>
                  <td className="px-5 py-3">
                    <SourceBadge source={a.source} />
                  </td>
                  <td className="px-5 py-3">
                    <Badge label={a.status} variant={attendanceVariant(a.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
