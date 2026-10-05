# Leave & Attendance Manager

A full-featured employee leave and attendance management web application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**, tested with **Playwright**.

---

## Features

| Module | Capabilities |
|---|---|
| **Dashboard** | Stats (employees, pending leaves, attendance today, approvals), recent activity feeds |
| **Leave Requests** | Apply for leave, filter by status, Admin approve / reject with review notes |
| **Attendance** | Clock In / Clock Out (with session timer), per-employee records, admin employee filter |
| **Leave Balance** | Visual progress bars for Annual / Sick / Casual leave per employee |
| **Admin Panel** | Full CRUD for employees — add, edit, delete with confirmation dialog |

---

## Tech Stack

- **Next.js 14** (App Router, `"use client"` pages)
- **TypeScript** (strict mode)
- **Tailwind CSS** (utility-first, no component library)
- **lucide-react** icons
- **Playwright** E2E tests (31 test cases across 5 spec files)
- Mock data via React Context — no backend required

---

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium

# Run development server
npm run dev
# → http://localhost:3000

# Run Playwright tests
npm run test:e2e

# Run Playwright with UI
npm run test:e2e:ui
```

---

## User Switching (Mock Auth)

Use the **dropdown in the top-right corner** to switch between users:

| User | Role | Department |
|---|---|---|
| Alice Johnson | **admin** | Engineering |
| Bob Smith | employee | Engineering |
| Carol White | employee | Design |
| David Brown | employee | Marketing |
| Eva Martinez | employee | HR |

---

## Project Structure

```
leave-attendance-app/
├── app/
│   ├── layout.tsx          ← Root layout + AppProvider
│   ├── page.tsx            ← Dashboard
│   ├── leave/page.tsx      ← Leave Requests
│   ├── attendance/page.tsx ← Attendance Tracking
│   ├── balance/page.tsx    ← Leave Balance
│   └── admin/page.tsx      ← Admin Panel
├── components/
│   ├── AppShell.tsx        ← Sidebar + Topbar wrapper
│   ├── Sidebar.tsx         ← Navigation sidebar
│   ├── Topbar.tsx          ← Header with user switcher
│   ├── Badge.tsx           ← Status badges
│   ├── Button.tsx          ← Reusable button
│   └── StatCard.tsx        ← Dashboard stat tiles
├── lib/
│   ├── types.ts            ← TypeScript domain types
│   ├── mockData.ts         ← Seed data
│   └── AppContext.tsx      ← Global state (React Context)
└── e2e/
    ├── dashboard.spec.ts
    ├── leave.spec.ts
    ├── attendance.spec.ts
    ├── balance.spec.ts
    └── admin.spec.ts
```

---

## Application Workflow

See the workflow diagram in `WORKFLOW.md`.
