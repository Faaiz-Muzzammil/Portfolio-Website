import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";

const TO_EMAIL = "faaizmuzzammil@gmail.com";

/* ============================================================
   THE SENDER, WHICH IS THE WHOLE REASON THIS FORM WAS SILENT.
   ------------------------------------------------------------
   The default here used to be `onboarding@resend.dev`, Resend's
   shared sandbox sender, chosen because it needs no setup. It
   cannot work for this form, and it failed in the way that is
   hardest to notice: the API key is valid, the request is
   well-formed, the POST is accepted by the network — and Resend
   answers 403 with

     "You can only send testing emails to your own email
      address (...). To send emails to other recipients, please
      verify a domain at resend.com/domains, and change the
      `from` address to an email using this domain."

   `onboarding@resend.dev` may only deliver to the address that
   registered the Resend account. This form delivers to
   TO_EMAIL, which is a different mailbox, so every genuine
   submission was refused at Resend and the visitor got the
   "not authorized" branch below — a form that looked like it
   worked, accepted the message, and dropped it.

   The account has a verified sending domain, so the fix is to
   send from it. Any mailbox on a verified domain may send
   anywhere, and the local part need not be a real inbox: a
   reply goes to `reply_to` — the person who wrote in — not to
   the envelope sender.

   CONTACT_FROM still overrides this, which is how the domain
   changes without a deploy. What changed is that the default
   is no longer a value that cannot succeed. */
const DEFAULT_FROM = "Portfolio <contact@marketeer.studio>";

/* Rate limiting uses an in-memory Map keyed by
   client IP. It resets per serverless instance, so it's a speed bump rather
   than a wall — paired with the honeypot that's the right level of effort
   for a portfolio contact form. */
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000;
const COOLDOWN_MS = 30 * 1000;

type Entry = { count: number; windowStart: number; lastRequest: number };
const store = new Map<string, Entry>();

/* The Map had no eviction, so every distinct IP that ever posted stayed in
   it for the life of the instance — a slow leak in any container that lives
   longer than a few minutes. Expired windows are swept once the map is big
   enough to be worth walking. */
const MAX_TRACKED_IPS = 10_000;

function sweep(now: number) {
    if (store.size < MAX_TRACKED_IPS) return;
    for (const [ip, entry] of store) {
        if (now - entry.windowStart > WINDOW_MS) store.delete(ip);
    }
}

/* Capped because it becomes a Map key: an attacker controls this header
   anywhere the platform does not overwrite it, and an unbounded key is
   unbounded memory. */
function getClientIP(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip");
    return (ip || "unknown").slice(0, 64);
}

/* The form posts ~5KB at most (4000-character message plus three short
   fields, JSON-escaped). Anything much larger is not this form. */
const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;

/* CROSS-SITE POSTS ARE REFUSED. A JSON POST from another origin is not a
   "simple" request, so a browser would preflight it and fail anyway — but
   that relies on the Content-Type check below holding, and on no one ever
   adding CORS headers here. Checking the origin directly makes the rule
   explicit: this endpoint serves this site's form and nothing else.
   `Sec-Fetch-Site` is the modern signal; `Origin` covers older agents.
   A request with neither is a non-browser client, which no header check
   could stop anyway — the rate limit and honeypot are for those. */
function isSameOrigin(req: NextRequest) {
    const site = req.headers.get("sec-fetch-site");
    if (site && site !== "same-origin" && site !== "none") return false;

    const origin = req.headers.get("origin");
    if (!origin) return true;
    try {
        return new URL(origin).host === (req.headers.get("host") ?? req.nextUrl.host);
    } catch {
        return false;
    }
}

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
    const now = Date.now();
    sweep(now);
    const entry = store.get(ip);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
        store.set(ip, { count: 1, windowStart: now, lastRequest: now });
        return { allowed: true };
    }

    if (now - entry.lastRequest < COOLDOWN_MS) {
        return { allowed: false, message: "Just a moment — try again in a few seconds." };
    }

    if (entry.count >= MAX_PER_WINDOW) {
        return {
            allowed: false,
            message: `That's ${MAX_PER_WINDOW} messages this hour. Email ${TO_EMAIL} directly.`,
        };
    }

    entry.count += 1;
    entry.lastRequest = now;
    return { allowed: true };
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/* The subject line is built from a visitor-supplied name, and a newline in a
   mail header is how a header is terminated — so a name containing one is a
   header-injection attempt. Collapse all whitespace and cap the length. */
function headerSafe(value: string) {
    return value.replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function POST(req: NextRequest) {
    try {
        if (!isSameOrigin(req)) {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
            return NextResponse.json({ error: "Please send the form again." }, { status: 415 });
        }

        /* Content-Length is checked first so an honest oversized request
           is refused unread; the length of what was actually read is
           checked second, because the header is the client's claim. */
        if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
            return NextResponse.json({ error: "That message is too large." }, { status: 413 });
        }

        let body: unknown;
        try {
            const raw = await req.text();
            if (raw.length > MAX_BODY_BYTES) {
                return NextResponse.json({ error: "That message is too large." }, { status: 413 });
            }
            body = JSON.parse(raw);
        } catch {
            return NextResponse.json(
                { error: "Please send the form again." },
                { status: 400 },
            );
        }

        /* VALIDATION RUNS BEFORE THE RATE LIMIT, AND THE ORDER IS THE BUG IT
           FIXES. The limiter enforces a 30-second cooldown between accepted
           requests. Checked first, a submission that failed validation still
           spent that cooldown — so the visitor corrected the field the form
           had just complained about, pressed send, and was told to wait. The
           form charged them for its own error message. A request that sends
           no mail should cost no budget. */
        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Some fields need another look.",
                    fields: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { name, email, subject, message, honeypot } = parsed.data;

        // Bots fill the hidden field. Report success, send nothing.
        if (honeypot) return NextResponse.json({ ok: true });

        const rate = checkRateLimit(getClientIP(req));
        if (!rate.allowed) {
            return NextResponse.json({ error: rate.message }, { status: 429 });
        }

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            /* console.error, not console.warn: `removeConsole` in
               next.config.ts strips every console method in production
               except `error`, so a warning here would be compiled out of
               precisely the build where a missing key matters. */
            console.error("[contact] RESEND_API_KEY is not set — message not delivered");
            return NextResponse.json(
                {
                    error: "Email delivery isn't configured yet.",
                    fallback: true,
                    mailto: TO_EMAIL,
                },
                { status: 503 },
            );
        }

        /* Raw fetch rather than the `resend` SDK: one POST, zero new
           dependencies. Note the snake_case `reply_to` — that is the REST
           API's spelling. The SDK's is `replyTo`, and sending the camelCase
           key to this endpoint silently drops the reply address. */
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            /* Without a ceiling a hung upstream holds the function open
               until the platform kills it, and the visitor's own 15s
               client timeout fires first with a less useful message. */
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            body: JSON.stringify({
                from: process.env.CONTACT_FROM ?? DEFAULT_FROM,
                to: [TO_EMAIL],
                reply_to: email,
                subject: subject
                    ? `[Portfolio] ${headerSafe(subject)} — ${headerSafe(name)}`
                    : `[Portfolio] Message from ${headerSafe(name)}`,
                /* Exactly what the visitor typed, field by field — the
                   mail is the submission, not a notice that one arrived. */
                text:
                    `Name: ${name}\nEmail: ${email}\n` +
                    (subject ? `Subject: ${subject}\n` : "") +
                    `\nMessage:\n${message}`,
                html:
                    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>` +
                    `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` +
                    (subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : "") +
                    `<p><strong>Message:</strong></p>` +
                    `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
            }),
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => "");
            console.error("[contact] Resend responded", res.status, detail.slice(0, 500));

            if (res.status === 401 || res.status === 403) {
                /* 401 is a bad or revoked key. 403 is almost always the
                   sender: an unverified `from` domain, or the sandbox sender
                   pointed at a mailbox that is not the account owner's. Both
                   are configuration rather than anything the visitor did, so
                   they get the direct address and the detail stays in the
                   log. */
                return NextResponse.json(
                    {
                        error: "Email delivery is not authorized. Please email me directly while this is fixed.",
                        fallback: true,
                        mailto: TO_EMAIL,
                    },
                    { status: 503 },
                );
            }

            return NextResponse.json(
                {
                    error: "That didn't send. Try again in a moment.",
                    fallback: true,
                    mailto: TO_EMAIL,
                },
                { status: 502 },
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof DOMException && error.name === "TimeoutError") {
            console.error("[contact] Resend timed out after", UPSTREAM_TIMEOUT_MS, "ms");
            return NextResponse.json(
                {
                    error: "Mail delivery is slow right now. Try again in a moment.",
                    fallback: true,
                    mailto: TO_EMAIL,
                },
                { status: 504 },
            );
        }
        console.error("[contact] Unexpected error:", error);
        return NextResponse.json(
            {
                error: "Something broke on our side.",
                fallback: true,
                mailto: TO_EMAIL,
            },
            { status: 500 },
        );
    }
}
