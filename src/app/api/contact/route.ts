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

function getClientIP(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") ?? "unknown";
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
        let body: unknown;
        try {
            body = await req.json();
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

        const { name, email, message, honeypot } = parsed.data;

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
            body: JSON.stringify({
                from: process.env.CONTACT_FROM ?? DEFAULT_FROM,
                to: [TO_EMAIL],
                reply_to: email,
                subject: `[Portfolio] Message from ${headerSafe(name)}`,
                /* Exactly what the visitor typed, field by field — the
                   mail is the submission, not a notice that one arrived. */
                text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                html:
                    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>` +
                    `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` +
                    `<p><strong>Message:</strong></p>` +
                    `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
            }),
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => "");
            console.error("[contact] Resend responded", res.status, detail);

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
