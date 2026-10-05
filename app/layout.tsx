import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/lib/SessionContext";
import { AppProvider } from "@/lib/AppContext";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: {
    default: "Leave & Attendance Manager",
    template: "%s | Leave & Attendance",
  },
  description: "Manage employee leave requests and attendance tracking",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* SessionProvider fetches /api/auth/me on mount to hydrate the current user */}
        <SessionProvider>
          <AppProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
