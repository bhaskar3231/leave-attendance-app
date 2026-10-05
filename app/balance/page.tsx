"use client";

import AppShell from "@/components/AppShell";
import { useApp } from "@/lib/AppContext";
import { USERS } from "@/lib/mockData";

function BalanceBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));
  return (
    <div className="mt-1">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{used} used / {total - used} remaining</p>
    </div>
  );
}

export default function BalancePage() {
  const { leaveBalances, currentUser } = useApp();
  if (!currentUser) return null;

  const balancesToShow =
    currentUser.role === "admin"
      ? leaveBalances
      : leaveBalances.filter((b) => b.employeeId === currentUser.id);

  return (
    <AppShell title="Leave Balance">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {balancesToShow.map((b) => {
          const employee = USERS.find((u) => u.id === b.employeeId);
          return (
            <div
              key={b.employeeId}
              className="bg-white rounded-xl border border-gray-200 p-6"
              data-testid={`balance-card-${b.employeeId}`}
            >
              {/* Employee header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  {employee?.avatar ?? "??"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{employee?.name ?? b.employeeId}</p>
                  <p className="text-xs text-gray-400">{employee?.department}</p>
                </div>
              </div>

              {/* Annual */}
              <div className="mb-4">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Annual Leave</span>
                  <span className="text-blue-600 font-bold">{b.annual - b.used.annual} / {b.annual}</span>
                </div>
                <BalanceBar used={b.used.annual} total={b.annual} color="bg-blue-500" />
              </div>

              {/* Sick */}
              <div className="mb-4">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Sick Leave</span>
                  <span className="text-red-500 font-bold">{b.sick - b.used.sick} / {b.sick}</span>
                </div>
                <BalanceBar used={b.used.sick} total={b.sick} color="bg-red-400" />
              </div>

              {/* Casual */}
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Casual Leave</span>
                  <span className="text-green-600 font-bold">{b.casual - b.used.casual} / {b.casual}</span>
                </div>
                <BalanceBar used={b.used.casual} total={b.casual} color="bg-green-500" />
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
