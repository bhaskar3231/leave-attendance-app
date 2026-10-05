"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { useApp } from "@/lib/AppContext";
import {
  Mail,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Pencil,
  X,
  CreditCard,
  Fingerprint,
  Smile,
  MousePointer,
} from "lucide-react";
import type { AttendanceSource } from "@/lib/types";

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "HR", "Finance", "Operations"];

function BalanceBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));
  return (
    <div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{used} used · {total - used} remaining</p>
    </div>
  );
}

const SOURCE_LABELS: Record<AttendanceSource, string> = {
  hid_card: "HID Card", fingerprint: "Fingerprint", face_scan: "Face Scan", manual: "Manual",
};

const SOURCE_ICONS: Record<AttendanceSource, React.ReactNode> = {
  hid_card:    <CreditCard   className="w-3 h-3" />,
  fingerprint: <Fingerprint  className="w-3 h-3" />,
  face_scan:   <Smile        className="w-3 h-3" />,
  manual:      <MousePointer className="w-3 h-3" />,
};

function ProfileContent({ userId }: { userId?: string }) {
  const { currentUser, users, attendanceRecords, leaveBalances, leaveRequests, updateUser } = useApp();
  const [editing, setEditing] = useState(false);

  const profileUser = userId
    ? users.find((u) => u.id === userId) ?? currentUser
    : currentUser;

  const [form, setForm] = useState({
    name: profileUser?.name ?? "",
    position: profileUser?.position ?? "",
    department: profileUser?.department ?? "",
  });

  if (!currentUser || !profileUser) return null;

  const isOwnProfile = profileUser.id === currentUser.id;
  const canEdit = isOwnProfile;

  // This month attendance
  const thisMonth = new Date().toISOString().slice(0, 7);
  const myRecords = attendanceRecords.filter(
    (a) => a.employeeId === profileUser.id && a.date.startsWith(thisMonth)
  );
  const presentCount  = myRecords.filter((a) => a.status === "Present").length;
  const absentCount   = myRecords.filter((a) => a.status === "Absent").length;
  const halfDayCount  = myRecords.filter((a) => a.status === "Half Day").length;

  // Leave balance
  const balance = leaveBalances.find((b) => b.employeeId === profileUser.id);

  // Recent clock events (last 5)
  const recentEvents = [...attendanceRecords]
    .filter((a) => a.employeeId === profileUser.id && a.clockIn)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Pending leaves
  const pendingLeaves = leaveRequests.filter(
    (r) => r.employeeId === profileUser.id && r.status === "Pending"
  ).length;

  function handleSave() {
    if (!profileUser) return;
    updateUser(profileUser.id, {
      name: form.name.trim(),
      position: form.position.trim(),
      department: form.department,
    });
    setEditing(false);
  }

  return (
    <AppShell title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Profile Card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />

          <div className="px-6 pb-6 -mt-10 relative">
            <div className="flex items-end justify-between">
              <div className="ring-4 ring-white rounded-full">
                <Avatar initials={profileUser.avatar} size="xl" online={isOwnProfile} />
              </div>
              {canEdit && !editing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(true)}
                  data-testid="edit-profile-btn"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              )}
            </div>

            {editing ? (
              <div className="mt-4 space-y-3" data-testid="edit-profile-form">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    data-testid="profile-name-input"
                    maxLength={80}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      data-testid="profile-position-input"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      data-testid="profile-dept-select"
                    >
                      {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} size="sm" data-testid="save-profile-btn">Save Changes</Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Attendance Summary ──────────────────────────────────── */}
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
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-3 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {pendingLeaves} pending leave request{pendingLeaves > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* ── Leave Balance ───────────────────────────────────────── */}
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

        {/* ── Recent Activity ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Recent Clock Events
          </h2>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No clock events yet</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-[1.4rem] top-2 bottom-2 w-px bg-gray-100" />
              {recentEvents.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-3" data-testid={`profile-event-${a.id}`}>
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

export default function ProfilePage() {
  return <ProfileContent />;
}
