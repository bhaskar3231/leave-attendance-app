/** @type {import('next').NextConfig} */
const nextConfig = {
  // bcryptjs + jose use Node.js crypto APIs in API routes (session.ts).
  // sessionEdge.ts uses jose/jwt/verify subpath — no Node.js-only deps — safe for Edge.
  serverExternalPackages: ["bcryptjs", "jose"],
  experimental: {},

  // ─── Security Headers ─────────────────────────────────────────────────────
  // Applied to every route. Covers OWASP Top-10 HTTP header recommendations.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options",          value: "SAMEORIGIN" },
          // Block MIME-type sniffing
          { key: "X-Content-Type-Options",   value: "nosniff" },
          // Force HTTPS for 1 year (prod only — harmless in dev)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Disable legacy XSS auditor (modern browsers ignore it; old ones need it off)
          { key: "X-XSS-Protection",         value: "0" },
          // Control referrer information leakage
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          // Restrict browser feature access
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Content Security Policy
          // – default-src: only same-origin
          // – script-src:  same-origin + Next.js nonce-based inline scripts via 'unsafe-inline'
          //               (acceptable here; replace with nonce in a real auth-backed deployment)
          // – style-src:   same-origin + inline styles (Tailwind CSS requires this)
          // – img-src:     same-origin + data URIs (avatars / icons)
          // – font-src:    same-origin
          // – connect-src: same-origin (no external API calls in this app)
          // – frame-src:   none
          // – object-src:  none (blocks Flash / plugins)
          // – base-uri:    self (prevents base-tag hijacking)
          // – form-action: self (prevents form redirect to attacker-controlled URL)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
