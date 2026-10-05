"use client";

import { useEffect } from "react";

// Global error boundary — catches errors in the root layout itself.
// Must be a Client Component and CANNOT use the root layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Global Error]", error.digest ?? error.name); // dev-only
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, "Segoe UI", system-ui, sans-serif',
          background: "#f9fafb",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 16px" }}>
          <p style={{ fontSize: 72, fontWeight: 900, color: "#e5e7eb", margin: "0 0 8px" }}>500</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1f2328", margin: "0 0 8px" }}>
            Application error
          </h1>
          <p style={{ fontSize: 14, color: "#57606a", margin: "0 0 24px" }}>
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
