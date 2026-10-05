"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import { useApp } from "@/lib/AppContext";
import { User, Role } from "@/lib/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "HR", "Finance", "Operations"];
const ROLES: Role[] = ["admin", "employee"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserForm {
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  avatar: string;
}

const emptyForm = (): UserForm => ({
  name: "",
  email: "",
  role: "employee",
  department: "Engineering",
  position: "",
  avatar: "",
});

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Modal shell with Escape + backdrop click + aria ─────────────────────────
function ModalShell({
  testId,
  onClose,
  labelId,
  wide,
  children,
}: {
  testId: string;
  onClose: () => void;
  labelId: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>(
      "input, select, textarea, button, [tabindex]"
    );
    first?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
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
        className={`bg-white rounded-2xl shadow-xl w-full mx-4 p-6 ${wide ? "max-w-lg" : "max-w-sm"}`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── User Form Modal ──────────────────────────────────────────────────────────
function UserModal({
  initial,
  onSave,
  onClose,
  title,
}: {
  initial: UserForm;
  onSave: (f: UserForm) => void;
  onClose: () => void;
  title: string;
}) {
  const [form, setForm] = useState<UserForm>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())            e.name     = "Full name is required.";
    if (form.name.trim().length < 2)  e.name     = "Name must be at least 2 characters.";
    if (!form.email.trim())           e.email    = "Email is required.";
    else if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.position.trim())        e.position = "Position is required.";
    return e;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, name: form.name.trim(), email: form.email.trim(), position: form.position.trim() });
  }

  const field = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const fieldErr = (k: string) => errors[k] ? "border-red-400" : "border-gray-300";

  return (
    <ModalShell testId="user-modal" onClose={onClose} labelId="user-modal-title" wide>
      <div className="flex items-center justify-between mb-5">
        <h2 id="user-modal-title" className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} aria-label="Close dialog">
          <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="um-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="um-name"
              className={`${field} ${fieldErr("name")}`}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value, avatar: initials(e.target.value) });
                setErrors((p) => ({ ...p, name: "" }));
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "um-name-err" : undefined}
              data-testid="user-name-input"
              placeholder="John Doe"
              maxLength={80}
            />
            {errors.name && <p id="um-name-err" className="text-xs text-red-500 mt-1" role="alert">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="um-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="um-email"
              type="email"
              className={`${field} ${fieldErr("email")}`}
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((p) => ({ ...p, email: "" })); }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "um-email-err" : undefined}
              data-testid="user-email-input"
              placeholder="john@acme.com"
              maxLength={254}
            />
            {errors.email && <p id="um-email-err" className="text-xs text-red-500 mt-1" role="alert">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="um-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="um-role"
              className={`${field} border-gray-300`}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              data-testid="user-role-select"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="um-dept" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              id="um-dept"
              className={`${field} border-gray-300`}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              data-testid="user-dept-select"
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="um-position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            id="um-position"
            className={`${field} ${fieldErr("position")}`}
            value={form.position}
            onChange={(e) => { setForm({ ...form, position: e.target.value }); setErrors((p) => ({ ...p, position: "" })); }}
            aria-invalid={!!errors.position}
            aria-describedby={errors.position ? "um-pos-err" : undefined}
            data-testid="user-position-input"
            placeholder="Software Engineer"
            maxLength={100}
          />
          {errors.position && <p id="um-pos-err" className="text-xs text-red-500 mt-1" role="alert">{errors.position}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={handleSave} data-testid="save-user-btn">Save Employee</Button>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </ModalShell>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useApp();
  const [showAdd, setShowAdd]           = useState(false);
  const [editing, setEditing]           = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  if (!currentUser) return null;

  if (currentUser.role !== "admin") {
    return (
      <AppShell title="Admin Panel">
        <div className="flex items-center justify-center h-64" role="alert">
          <p className="text-gray-500">You do not have access to this page.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin Panel">
      {showAdd && (
        <UserModal
          title="Add Employee"
          initial={emptyForm()}
          onSave={(f) => { addUser({ ...f }); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <UserModal
          title="Edit Employee"
          initial={{
            name:       editing.name,
            email:      editing.email,
            role:       editing.role,
            department: editing.department,
            position:   editing.position,
            avatar:     editing.avatar,
          }}
          onSave={(f) => { updateUser(editing.id, f); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
      {confirmDelete && (
        <ModalShell testId="delete-confirm-modal" onClose={() => setConfirmDelete(null)} labelId="delete-modal-title">
          <div className="text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" aria-hidden="true" />
            <h3 id="delete-modal-title" className="font-semibold text-gray-800 mb-1">Delete Employee?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will remove <strong>{confirmDelete.name}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="danger"
                onClick={() => { deleteUser(confirmDelete.id); setConfirmDelete(null); }}
                data-testid="confirm-delete-btn"
              >
                Delete
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            </div>
          </div>
        </ModalShell>
      )}

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{users.length} employee{users.length !== 1 ? "s" : ""}</p>
        <Button onClick={() => setShowAdd(true)} data-testid="add-employee-btn">
          <Plus className="w-4 h-4" aria-hidden="true" /> Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100" data-testid="admin-table">
          <thead className="bg-gray-50">
            <tr>
              {["Employee", "Email", "Department", "Position", "Role", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50" data-testid={`admin-row-${u.id}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0" aria-hidden="true">
                      {u.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{u.department}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{u.position}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(u)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      data-testid={`edit-btn-${u.id}`}
                      aria-label={`Edit ${u.name}`}
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(u)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid={`delete-btn-${u.id}`}
                      disabled={u.id === currentUser.id}
                      aria-label={`Delete ${u.name}`}
                      aria-disabled={u.id === currentUser.id}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
