---
name: Web Security Expert
description: Critical security practices for Next.js applications, covering OWASP, Auth, and Headers.
---

# Web Security Expert

## Authentication & Authorization
- **Middleware Protection**: Use Next.js Middleware to protect private routes at the edge.
- **Session Handling**: Never store sensitive tokens in `localStorage`. Use `HttpOnly` cookies.
- **Role-Based Access Control (RBAC)**: Check roles on *every* Server Action, not just in the UI.

## Common Vulnerabilities (OWASP)
1.  **Injection (SQL/NoSQL)**: Always use ORMs (Prisma) or parameterized queries.
2.  **XSS (Cross-Site Scripting)**: React sanitizes by default, but be careful with `dangerouslySetInnerHTML`. Sanitize content with `dompurify` if used.
3.  **CSRF**: Next.js Server Actions are protected by origin checks, but ensure API routes verify Origin/Referer headers.

## Security Headers
Configure `next.config.js` to send security headers:
- **X-content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY` (prevent clickjacking)
- **Content-Security-Policy (CSP)**: Restrict sources of scripts, styles, and images.

## Data Protection
- **Environment Variables**: Never commit `.env` files. Ensure secret keys (e.g., `STRIPE_SECRET_KEY`) are not prefixed with `NEXT_PUBLIC_`.
- **Rate Limiting**: Implement rate limiting code (e.g., `upstash/ratelimit`) on public API routes to prevent DoS.
