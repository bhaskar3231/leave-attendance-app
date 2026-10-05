"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { Badge, leaveStatusVariant } from "@/components/Badge";
import Button from "@/components/Button";
import { useApp } from "@/lib/AppContext";
import { LeaveRequest, LeaveType } from "@/lib/types";
import { Plus, CheckCircle, XCircle, Filter } from "lucide-react";

const LEAVE_TYPES: LeaveType[] = ["Annual", "Sick", "Casual", "Unpaid", "Maternity", "Paternity"];
const MAX_REASON_LENGTH = 500;

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

// ─── Reusable modal wrapper with Escape + backdrop close + aria ──────────────
function ModalBackdrop({
  testId,
  onClose,
  labelId,
  children,
}: {
  testId: string;
  onClose: () => void;
  labelId: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Auto-focus first focusable child on open
  useEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>(
      "input, select, textarea, button, [tabindex]"
    );
    first?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      data-testid={testId}
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
      >
        {children}
      </div>
    </div>
  );
}

// ─── Apply Leave Modal ────────────────────────────────────────────────────────
function ApplyModal({ onClose }: { onClose: () => void }) {
  const { applyLeave, currentUser } = useApp();
  const [form, setForm] = useState({
    leaveType: "Annual" as LeaveType,
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.startDate) e.startDate = "Start date is required.";
    if (!form.endDate)   e.endDate   = "End date is required.";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = "End date must be on or after start date.";
    if (!form.reason.trim())                    e.reason = "Reason is required.";
    if (form.reason.length > MAX_REASON_LENGTH) e.reason = `Max ${MAX_REASON_LENGTH} characters.`;
    return e;
  }, [form]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    applyLeave({
      employeeId:   currentUser.id,
      employeeName: currentUser.name,
      department:   currentUser.department,
      leaveType:    form.leaveType,
      startDate:    form.startDate,
      endDate:      form.endDate,
      days:         daysBetween(form.startDate, form.endDate),
      reason:       form.reason.trim(),
    });
    onClose();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <ModalBackdrop testId="apply-leave-modal" onClose={onClose} labelId="apply-leave-title">
      <h2 id="apply-leave-title" className="text-lg font-semibold mb-5">Apply for Leave</h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="leave-type" className="block text-sm font-medium text-gray-700 mb-1">
            Leave Type
          </label>
          <select
            id="leave-type"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value as LeaveType })}
            data-testid="leave-type-select"
          >
            {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              min={today}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? "border-red-400" : "border-gray-300"}`}
              value={form.startDate}
              onChange={(e) => { setForm({ ...form, startDate: e.target.value }); setErrors((p) => ({ ...p, startDate: "" })); }}
              aria-invalid={!!errors.startDate}
              aria-describedby={errors.startDate ? "start-date-err" : undefined}
              data-testid="leave-start-date"
            />
            {errors.startDate && <p id="start-date-err" className="text-xs text-red-500 mt-1" role="alert">{errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              min={form.startDate || today}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? "border-red-400" : "border-gray-300"}`}
              value={form.endDate}
              onChange={(e) => { setForm({ ...form, endDate: e.target.value }); setErrors((p) => ({ ...p, endDate: "" })); }}
              aria-invalid={!!errors.endDate}
              aria-describedby={errors.endDate ? "end-date-err" : undefined}
              data-testid="leave-end-date"
            />
            {errors.endDate && <p id="end-date-err" className="text-xs text-red-500 mt-1" role="alert">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            id="reason"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reason ? "border-red-400" : "border-gray-300"}`}
            rows={3}
            maxLength={MAX_REASON_LENGTH}
            value={form.reason}
            onChange={(e) => { setForm({ ...form, reason: e.target.value }); setErrors((p) => ({ ...p, reason: "" })); }}
            aria-invalid={!!errors.reason}
            aria-describedby={errors.reason ? "reason-err" : undefined}
            data-testid="leave-reason"
          />
          <div className="flex justify-between mt-1">
            {errors.reason
              ? <p id="reason-err" className="text-xs text-red-500" role="alert">{errors.reason}</p>
              : <span />}
            <p className="text-xs text-gray-400">{form.reason.length}/{MAX_REASON_LENGTH}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" data-testid="submit-leave-btn">
            Submit Request
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ req, onClose }: { req: LeaveRequest; onClose: () => void }) {
  const { reviewLeave } = useApp();
  const [note, setNote] = useState("");

  return (
    <ModalBackdrop testId="review-leave-modal" onClose={onClose} labelId="review-modal-title">
      <h2 id="review-modal-title" className="text-lg font-semibold mb-1">Review Leave Request</h2>
      <p className="text-sm text-gray-500 mb-4">
        {req.employeeName} — {req.leaveType} · {req.days} day(s) · {req.startDate} to {req.endDate}
      </p>
      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-4">{req.reason}</p>
      <div className="mb-4">
        <label htmlFor="review-note-field" className="block text-sm font-medium text-gray-700 mb-1">
          Review Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="review-note-field"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          data-testid="review-note"
        />
      </div>
      <div className="flex gap-3">
        <Button
          variant="success"
          onClick={() => { reviewLeave(req.id, "Approved", note.trim() || undefined); onClose(); }}
          data-testid="approve-btn"
        >
          <CheckCircle className="w-4 h-4" /> Approve
        </Button>
        <Button
          variant="danger"
          onClick={() => { reviewLeave(req.id, "Rejected", note.trim() || undefined); onClose(); }}
          data-testid="reject-btn"
        >
          <XCircle className="w-4 h-4" /> Reject
        </Button>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </ModalBackdrop>
  );
}

// ─── Leave Page ───────────────────────────────────────────────────────────────
export default function LeavePage() {
  const { leaveRequests, currentUser } = useApp();
  const [showApply, setShowApply]   = useState(false);
  const [reviewing, setReviewing]   = useState<LeaveRequest | null>(null);
  const [filter, setFilter]         = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  if (!currentUser) return null;

  const visible = leaveRequests.filter((r) => {
    if (currentUser.role !== "admin" && r.employeeId !== currentUser.id) return false;
    if (filter !== "All" && r.status !== filter) return false;
    return true;
  });

  return (
    <AppShell title="Leave Requests">
      {showApply && <ApplyModal onClose={() => setShowApply(false)} />}
      {reviewing && <ReviewModal req={reviewing} onClose={() => setReviewing(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2" role="group" aria-label="Filter leave requests">
          <Filter className="w-4 h-4 text-gray-400" aria-hidden="true" />
          {(["All", "Pending", "Approved", "Rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              data-testid={`filter-${f.toLowerCase()}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowApply(true)} data-testid="apply-leave-btn">
          <Plus className="w-4 h-4" aria-hidden="true" /> Apply Leave
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100" data-testid="leave-table">
          <thead className="bg-gray-50">
            <tr>
              {["Employee", "Type", "Duration", "Dates", "Reason", "Applied On", "Status",
                currentUser.role === "admin" ? "Action" : ""].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                  No leave requests found
                </td>
              </tr>
            )}
            {visible.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50" data-testid={`leave-row-${r.id}`}>
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-800">{r.employeeName}</p>
                  <p className="text-xs text-gray-400">{r.department}</p>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{r.leaveType}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{r.days} day{r.days !== 1 ? "s" : ""}</td>
                <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {r.startDate} → {r.endDate}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 max-w-[160px] truncate">{r.reason}</td>
                <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{r.appliedOn}</td>
                <td className="px-5 py-3">
                  <Badge label={r.status} variant={leaveStatusVariant(r.status)} />
                </td>
                {currentUser.role === "admin" && (
                  <td className="px-5 py-3">
                    {r.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setReviewing(r)}
                        data-testid={`review-btn-${r.id}`}
                        aria-label={`Review leave request for ${r.employeeName}`}
                      >
                        Review
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
