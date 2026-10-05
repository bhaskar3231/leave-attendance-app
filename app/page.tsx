"use client";

import AppShell from "@/components/AppShell";
import { Badge, leaveStatusVariant, attendanceVariant } from "@/components/Badge";
import { useApp } from "@/lib/AppContext";
import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function StatCard({
  label,
  value,
  icon,
  sub,
  trend,
  borderColor,
  testId,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  borderColor: string;
  testId?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-l-4 ${borderColor}`}
      data-testid={testId}
    >
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{label}</p>
        {sub && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            {trend === "up"      && <TrendingUp   className="w-3 h-3 text-emerald-500" />}
            {trend === "down"    && <TrendingDown  className="w-3 h-3 text-red-500"    />}
            {trend === "neutral" && <Minus          className="w-3 h-3 text-gray-400"   />}
            {sub}
          </p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gray-50 flex-shrink-0">
        {icon}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { leaveRequests, attendanceRecords, users, currentUser } = useApp();
  if (!currentUser) return null;

  const pending      = leaveRequests.filter((r) => r.status === "Pending").length;
  const approved     = leaveRequests.filter((r) => r.status === "Approved").length;
  const today        = new Date().toISOString().slice(0, 10);
  const presentToday = attendanceRecords.filter(
    (a) => a.date === today && a.status === "Present"
  ).length;

  const recentLeave  = [...leaveRequests].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)).slice(0, 5);
  const recentAttend = [...attendanceRecords]
    .filter((a) => currentUser.role === "admin" || a.employeeId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell title="Dashboard">
      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-24" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">{greeting},</p>
            <h2 className="text-white text-2xl font-bold mt-0.5">{currentUser.name} 👋</h2>
            <p className="text-blue-200 text-sm mt-1">
              {currentUser.department} · <span className="capitalize">{currentUser.role}</span>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-blue-200 text-sm">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Employees"
          value={users.length}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          sub="Active team members"
          trend="neutral"
          borderColor="border-l-blue-500"
          testId="stat-employees"
        />
        <StatCard
          label="Pending Leaves"
          value={pending}
          icon={<CalendarDays className="w-6 h-6 text-amber-500" />}
          sub={pending > 0 ? "Awaiting review" : "All reviewed"}
          trend={pending > 0 ? "up" : "neutral"}
          borderColor="border-l-amber-400"
          testId="stat-pending"
        />
        <StatCard
          label="Present Today"
          value={presentToday || "—"}
          icon={<Clock className="w-6 h-6 text-emerald-600" />}
          sub="Clocked in today"
          trend="neutral"
          borderColor="border-l-emerald-500"
          testId="stat-present"
        />
        <StatCard
          label="Approved Leaves"
          value={approved}
          icon={<CheckCircle className="w-6 h-6 text-indigo-600" />}
          sub="This period"
          trend="up"
          borderColor="border-l-indigo-500"
          testId="stat-approved"
        />
      </div>

      {/* ── Content Panels ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-xl border border-gray-200" data-testid="recent-leaves-table">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Leave Requests</h2>
            <Link href="/leave" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentLeave.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <CalendarDays className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No leave requests yet</p>
              <p className="text-xs text-gray-400 mt-1">Leave requests will appear here once submitted</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentLeave.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.employeeName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.leaveType} · {r.days}d · {r.startDate}</p>
                  </div>
                  <Badge label={r.status} variant={leaveStatusVariant(r.status)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl border border-gray-200" data-testid="recent-attendance-table">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Attendance</h2>
            <Link href="/attendance" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentAttend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Clock className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No attendance records yet</p>
              <p className="text-xs text-gray-400 mt-1">Clock in to start tracking attendance</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[2.3rem] top-0 bottom-0 w-px bg-gray-100" />
              {recentAttend.map((a, idx) => (
                <div key={a.id} className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50/50 transition-colors">
                  {/* Timeline dot */}
                  <div className={`mt-1 w-3 h-3 rounded-full border-2 flex-shrink-0 z-10 ${
                    a.status === "Present"  ? "border-emerald-500 bg-emerald-100"
                    : a.status === "Absent" ? "border-red-400 bg-red-50"
                    : a.status === "Half Day" ? "border-amber-400 bg-amber-50"
                    : "border-blue-400 bg-blue-50"
                  } ${idx === 0 ? "mt-1" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">{a.employeeName}</p>
                      <Badge label={a.status} variant={attendanceVariant(a.status)} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.date} · In: {a.clockIn ?? "—"} · Out: {a.clockOut ?? "—"}
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
