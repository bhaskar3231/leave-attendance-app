# Leave & Attendance Manager

A production-quality employee leave and attendance management web application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Playwright** E2E tests.

---

## ✨ Features

| Module | Capabilities |
|---|---|
| **Dashboard** | Welcome banner, gradient stat cards with trends, activity timeline, "View all" shortcuts |
| **Leave Requests** | Apply for leave, filter by status, Admin approve/reject with review notes |
| **Attendance** | Clock In/Out (manual), Device Simulator (HID/Fingerprint/Face), source badges per record |
| **Leave Balance** | Visual progress bars for Annual/Sick/Casual leave per employee |
| **Admin Panel** | Full CRUD for employees — add, edit, delete with confirmation dialog |
| **Profile** | Avatar, role badge, department, attendance summary, leave balance bars, recent clock events; edit own profile |
| **Device Simulator** | Demo HID Card Reader, Fingerprint Scanner, Face Scanner — fires real punch events + toast notifications |

---

## 🔐 Auth

JWT-based authentication with httpOnly cookies, RBAC middleware (admin-only routes), and per-user session isolation.

| User | Email | Role | Department |
|---|---|---|---|
| Alice Johnson | alice@acme.com | **admin** | Engineering |
| Bob Smith | bob@acme.com | employee | Engineering |
| Carol White | carol@acme.com | employee | Design |
| David Brown | david@acme.com | employee | Marketing |
| Eva Martinez | eva@acme.com | employee | HR |

**Password for all accounts:** `Password1!`

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local
# Fill in SESSION_SECRET (at least 32 chars)

# Install Playwright browsers (first time only)
npx playwright install chromium

# Run development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Run Playwright E2E tests
npm run test:e2e

# Playwright with UI
npm run test:e2e:ui
```

---

## 🗂 Project Structure

```
leave-attendance-app/
├── app/
│   ├── layout.tsx              ← Root layout + providers
│   ├── page.tsx                ← Dashboard
│   ├── login/page.tsx          ← Split-panel login
│   ├── leave/page.tsx          ← Leave Requests
│   ├── attendance/page.tsx     ← Attendance + Device Simulator
│   ├── balance/page.tsx        ← Leave Balance
│   ├── admin/page.tsx          ← Admin Panel
│   ├── profile/page.tsx        ← My Profile
│   └── profile/[id]/page.tsx   ← Admin: view any employee profile
├── components/
│   ├── AppShell.tsx            ← Sidebar + Topbar wrapper
│   ├── Sidebar.tsx             ← Collapsible nav with active states
│   ├── Topbar.tsx              ← Header with user menu + profile link
│   ├── Avatar.tsx              ← Reusable avatar with online indicator
│   ├── Badge.tsx               ← Status badges
│   ├── Button.tsx              ← Reusable button
│   ├── StatCard.tsx            ← Dashboard stat tiles
│   ├── DeviceSimulator.tsx     ← HID/Fingerprint/Face simulator panel
│   ├── Toast.tsx               ← Toast notification system + provider
│   └── SkeletonLoader.tsx      ← Loading skeleton components
├── lib/
│   ├── types.ts                ← TypeScript domain types
│   ├── mockData.ts             ← Seed data including DEVICES
│   ├── AppContext.tsx          ← Global state (React Context)
│   └── SessionContext.tsx      ← Auth session context
├── e2e/
│   ├── fixtures.ts             ← loginAs helper + extended test
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   ├── leave.spec.ts
│   ├── attendance.spec.ts
│   ├── balance.spec.ts
│   ├── admin.spec.ts
│   ├── profile.spec.ts         ← NEW
│   └── devices.spec.ts         ← NEW
├── vercel.json                 ← Vercel config
└── middleware.ts               ← JWT + RBAC middleware
```

---

## ☁️ Vercel Deployment

### Option A — Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod
```

### Option B — Vercel Dashboard

1. Push to GitHub: `git remote add origin <your-repo-url> && git push -u origin main`
2. Go to [vercel.com/new](https://vercel.com/new), import the repo
3. Framework will be auto-detected as **Next.js**
4. Add environment variable in the Vercel dashboard:
   - `SESSION_SECRET` → any random 32+ character string (use `openssl rand -hex 32`)
5. Click **Deploy**

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | ✅ | JWT signing secret — min 32 chars, must be set in Vercel dashboard |

> **Note:** The app uses in-memory mock data. No database or external service is required.

---

## 🧪 Test Coverage

| Spec | Tests |
|---|---|
| auth.spec.ts | Login/logout, RBAC, wrong credentials, demo buttons |
| dashboard.spec.ts | Stat cards, nav links, notification bell |
| leave.spec.ts | Apply, filter, approve, reject, validation |
| attendance.spec.ts | Clock in/out, admin filter, source badges, device simulator |
| balance.spec.ts | Per-role card visibility |
| admin.spec.ts | CRUD, validation, delete confirmation |
| profile.spec.ts | Load, edit, role badge, nav links |
| devices.spec.ts | Panel render, punch events, toast, clock state toggle |
