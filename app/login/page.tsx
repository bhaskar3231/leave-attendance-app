"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Shield,
  TrendingUp,
} from "lucide-react";

const FEATURES = [
  {
    icon: <CalendarDays className="w-5 h-5" />,
    title: "Smart Leave Management",
    desc: "Apply, track and approve leaves with one click.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Real-Time Attendance",
    desc: "Clock in/out manually or via device simulators.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Team Overview",
    desc: "Admins get a full bird's-eye view of every team member.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Role-Based Access",
    desc: "Secure JWT authentication with RBAC enforcement.",
  },
];

const STATS = [
  { label: "Employees", value: "5" },
  { label: "Departments", value: "4" },
  { label: "Uptime", value: "99.9%" },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get("returnUrl") ?? "/";
      router.replace(returnUrl);
    } catch {
      setError("Unable to connect. Please check your network.");
    } finally {
      setLoading(false);
    }
  }, [form, router]);

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* ── Left panel: branding ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white leading-tight block">Leave &amp; Attendance</span>
              <span className="text-blue-200 text-xs font-medium">by Acme Corp</span>
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Workforce management,<br />
            <span className="text-blue-200">simplified.</span>
          </h1>
          <p className="text-blue-100 text-base mb-10 max-w-sm leading-relaxed">
            A unified platform to manage leaves, track attendance, and keep your team in sync — all in one place.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="p-1.5 bg-white/15 rounded-lg text-white mt-0.5 flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex items-center gap-8 border-t border-white/20 pt-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-blue-200 text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>v1.0 production</span>
          </div>
        </div>
      </div>

      {/* ── Right panel: login form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Leave &amp; Attendance</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-7">Sign in to your account to continue.</p>

            {/* Error banner */}
            {error && (
              <div
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5"
                role="alert"
                data-testid="login-error"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="you@acme.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  data-testid="email-input"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    data-testid="password-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Demo credentials
              </p>
              <div className="space-y-1.5">
                {[
                  { label: "Admin",    email: "alice@acme.com", badge: "Admin"    },
                  { label: "Employee", email: "bob@acme.com",   badge: "Employee" },
                ].map(({ label, email, badge }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => setForm({ email, password: "Password1!" })}
                    className="flex items-center justify-between w-full text-left text-xs text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-blue-100 transition-all"
                    data-testid={`demo-${label.toLowerCase()}`}
                  >
                    <span className="font-medium">{email}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {badge}
                    </span>
                  </button>
                ))}
                <p className="text-[10px] text-gray-400 mt-1.5 px-1">Password for all accounts: Password1!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
