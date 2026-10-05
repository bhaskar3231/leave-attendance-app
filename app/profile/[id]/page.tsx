"use client";

import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import { useApp } from "@/lib/AppContext";
import {
  Mail,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  CreditCard,
  Fingerprint,
  Smile,
  MousePointer,
} from "lucide-react";
import type { AttendanceSource } from "@/lib/types";

const SOURCE_LABELS: Record<AttendanceSource, string> = {
  hid_card: "HID Card", fingerprint: "Fingerprint", face_scan: "Face Scan", manual: "Manual",
};
const SOURCE_ICONS: Record<AttendanceSource, React.ReactNode> = {
  hid_card:    <CreditCard   className="w-3 h-3" />,
  fingerprint: <Fingerprint  className="w-3 h-3" />,
  face_scan:   <Smile        className="w-3 h-3" />,
  manual:      <MousePointer className="w-3 h-3" />,
};

function BalanceBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));
  return (
    <div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{used} used · {total - used} remaining</p>
    </div>
  );
}

export default function ProfileByIdPage() {
  const params = useParams<{ id: string }>();
  const { currentUser, users, attendanceRecords, leaveBalances, leaveRequests } = useApp();

  if (!currentUser) return null;

  // Only admins can view other profiles
  if (currentUser.role !== "admin") {
    return (
      <AppShell title="Profile">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">You do not have permission to view this page.</p>
        </div>
      </AppShell>
    );
  }

  const profileUser = users.find((u) => u.id === params.id);
  if (!profileUser) {
    return (
      <AppShell title="Profile">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-gray-500 font-medium">Employee not found</p>
          <p className="text-xs text-gray-400">ID: {params.id}</p>
        </div>
      </AppShell>
    );
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const myRecords  = attendanceRecords.filter((a) => a.employeeId === profileUser.id && a.date.startsWith(thisMonth));
  const presentCount = myRecords.filter((a) => a.status === "Present").length;
  const absentCount  = myRecords.filter((a) => a.status === "Absent").length;
  const halfDayCount = myRecords.filter((a) => a.status === "Half Day").length;

  const balance = leaveBalances.find((b) => b.employeeId === profileUser.id);
  const recentEvents = [...attendanceRecords]
    .filter((a) => a.employeeId === profileUser.id && a.clockIn)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const pendingLeaves = leaveRequests.filter((r) => r.employeeId === profileUser.id && r.status === "Pending").length;

  return (
    <AppShell title={`${profileUser.name}'s Profile`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" data-testid="profile-card">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="px-6 pb-6 -mt-10">
            <div className="ring-4 ring-white rounded-full inline-block">
              <Avatar initials={profileUser.avatar} size="xl" />
            </div>
            <div className="mt-4">
              <h1 className="text-xl font-bold text-gray-900" data-testid="profile-name">{profileUser.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  profileUser.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`} data-testid="profile-role-badge">
                  {profileUser.role}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />{profileUser.department}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />{profileUser.position}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />{profileUser.email}
                </span>
                {profileUser.joinDate && (
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    Joined {new Date(profileUser.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Attendance This Month
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">Present</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                <p className="text-xs text-red-500 mt-1 font-medium">Absent</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{halfDayCount}</p>
                <p className="text-xs text-amber-500 mt-1 font-medium">Half Day</p>
              </div>
            </div>
            {pendingLeaves > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-3">
                {pendingLeaves} pending leave request{pendingLeaves > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Leave Balance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" /> Leave Balance
            </h2>
            {balance ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Annual Leave</span>
                    <span className="text-blue-600 font-bold">{balance.annual - balance.used.annual} / {balance.annual}</span>
                  </div>
                  <BalanceBar used={balance.used.annual} total={balance.annual} color="bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Sick Leave</span>
                    <span className="text-red-500 font-bold">{balance.sick - balance.used.sick} / {balance.sick}</span>
                  </div>
                  <BalanceBar used={balance.used.sick} total={balance.sick} color="bg-red-400" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Casual Leave</span>
                    <span className="text-emerald-600 font-bold">{balance.casual - balance.used.casual} / {balance.casual}</span>
                  </div>
                  <BalanceBar used={balance.used.casual} total={balance.casual} color="bg-emerald-500" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No leave balance record found.</p>
            )}
          </div>
        </div>

        {/* Recent Clock Events */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Recent Clock Events
          </h2>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No clock events found.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[0.65rem] top-2 bottom-2 w-px bg-gray-100" />
              {recentEvents.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-300 flex-shrink-0 z-10 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">{a.date}</p>
                      {a.source && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          {SOURCE_ICONS[a.source]} {SOURCE_LABELS[a.source]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      In: <span className="font-medium">{a.clockIn}</span>
                      {a.clockOut && <> · Out: <span className="font-medium">{a.clockOut}</span></>}
                      {a.hoursWorked && <> · <span className="font-medium text-blue-700">{a.hoursWorked}h</span></>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
