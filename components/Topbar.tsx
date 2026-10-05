"use client";

import Link from "next/link";
import { Bell, KeyRound, LogOut, ChevronDown, UserCircle } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { useSession } from "@/lib/SessionContext";
import { useState, useRef, useEffect } from "react";
import Avatar from "@/components/Avatar";

export default function Topbar({ title }: { title: string }) {
  const { leaveRequests } = useApp();
  const { user, logout }  = useSession();
  const pendingCount      = leaveRequests.filter((r) => r.status === "Pending").length;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 min-h-[64px]" data-testid="topbar">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification bell — admin sees pending count */}
        {user?.role === "admin" && (
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" data-testid="notification-bell" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-600" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        )}

        {/* User menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              data-testid="user-menu-btn"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <Avatar initials={user.avatar} size="sm" online={true} />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1"
                role="menu"
                data-testid="user-dropdown"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {user.role}
                  </span>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  role="menuitem"
                  data-testid="profile-link"
                >
                  <UserCircle className="w-4 h-4 text-gray-400" />
                  My Profile
                </Link>

                <Link
                  href="/change-password"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  role="menuitem"
                  data-testid="change-password-link"
                >
                  <KeyRound className="w-4 h-4 text-gray-400" />
                  Change Password
                </Link>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { setMenuOpen(false); void logout(); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    role="menuitem"
                    data-testid="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
