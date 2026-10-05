"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

function PasswordInput({
  id,
  label,
  value,
  onChange,
  testId,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testId}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.current || !form.next || !form.confirm) {
      setError("All fields are required."); return;
    }
    if (!PASSWORD_RE.test(form.next)) {
      setError("New password must be ≥8 chars and include uppercase, number, and special character."); return;
    }
    if (form.next !== form.confirm) {
      setError("Passwords do not match."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Failed to change password.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.replace("/"), 2000);
    } catch {
      setError("Unable to connect. Please check your network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Change Password">
      <div className="max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-6">
            Choose a strong password: at least 8 characters, one uppercase letter, one number, and one special character.
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5" role="alert" data-testid="change-pw-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5" role="status" data-testid="change-pw-success">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />Password updated! Redirecting…
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <PasswordInput id="current-pw"  label="Current Password"  value={form.current}  onChange={(v) => setForm({ ...form, current: v })}  testId="current-pw-input"  autoComplete="current-password" />
            <PasswordInput id="new-pw"      label="New Password"      value={form.next}     onChange={(v) => setForm({ ...form, next: v })}      testId="new-pw-input"      autoComplete="new-password" />
            <PasswordInput id="confirm-pw"  label="Confirm Password"  value={form.confirm}  onChange={(v) => setForm({ ...form, confirm: v })}  testId="confirm-pw-input"  autoComplete="new-password" />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} data-testid="change-pw-submit">
                {loading ? "Saving…" : "Update Password"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
