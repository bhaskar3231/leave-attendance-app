"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  Clock,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "@/lib/SessionContext";
import Avatar from "@/components/Avatar";
import clsx from "clsx";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/",           label: "Dashboard",      icon: LayoutDashboard, data: "dashboard" },
  { href: "/leave",      label: "Leave Requests", icon: CalendarDays,    data: "leave" },
  { href: "/attendance", label: "Attendance",     icon: Clock,           data: "attendance" },
  { href: "/balance",    label: "Leave Balance",  icon: ClipboardList,   data: "balance" },
  { href: "/profile",    label: "My Profile",     icon: UserCircle,      data: "profile" },
  { href: "/admin",      label: "Admin",          icon: Users,           data: "admin", adminOnly: true },
];

export default function Sidebar() {
  const pathname    = usePathname();
  const { user }    = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "flex flex-col min-h-screen bg-gray-900 text-white transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className={clsx(
        "flex items-center gap-2 px-4 py-5 border-b border-gray-700 min-h-[64px]",
        collapsed && "justify-center px-0"
      )}>
        <CalendarDays className="w-7 h-7 text-blue-400 flex-shrink-0" />
        {!collapsed && (
          <span className="font-bold text-base leading-tight whitespace-nowrap overflow-hidden">
            Leave &amp; Attendance
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => {
            const Icon   = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.data}`}
                title={collapsed ? item.label : undefined}
                className={clsx(
                  "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                  collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
                )}
              >
                <Icon className={clsx("flex-shrink-0 transition-transform duration-200", collapsed ? "w-5 h-5" : "w-5 h-5", active && !collapsed && "-translate-x-0")} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                )}
              </Link>
            );
          })}
      </nav>

      {/* User info */}
      {user && (
        <div className={clsx(
          "px-2 py-4 border-t border-gray-700",
          collapsed && "flex justify-center"
        )}>
          {collapsed ? (
            <div title={user.name}>
              <Avatar initials={user.avatar} size="sm" online={true} />
            </div>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
              data-testid="sidebar-user"
            >
              <Avatar initials={user.avatar} size="sm" online={true} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 flex-shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-all z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        data-testid="sidebar-toggle"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
