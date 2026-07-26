import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";

const TO_EMAIL = "faaizmuzzammil@gmail.com";

/* Rate limiting mirrors src/app/api/tts/route.ts: an in-memory Map keyed by
   client IP. It resets per serverless instance, so it's a speed bump rather
   than a wall — paired with the honeypot that's the right level of effort
   for a portfolio contact form. */
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000;
const COOLDOWN_MS = 30 * 1000;

type Entry = { count: number; windowStart: number; lastRequest: number };
const store = new Map<string, Entry>();

function getClientIP(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
    const now = Date.now();
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
        .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
    try {
        const rate = checkRateLimit(getClientIP(req));
        if (!rate.allowed) {
            return NextResponse.json({ error: rate.message }, { status: 429 });
        }

        // The client parses too, but that's convenience — this is the boundary.
        const parsed = contactSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Some fields need another look.",
                    fields: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { name, email, topic, message, honeypot } = parsed.data;

        // Bots fill the hidden field. Report success, send nothing.
        if (honeypot) return NextResponse.json({ ok: true });

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn("[contact] RESEND_API_KEY is not set — message not delivered");
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
           dependencies, and it matches how api/tts/route.ts calls ElevenLabs. */
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
                to: [TO_EMAIL],
                reply_to: email,
                subject: `[Portfolio] ${topic} — ${name}`,
                text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
                html:
                    `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p>` +
                    `<p><strong>Topic:</strong> ${escapeHtml(topic)}</p>` +
                    `<hr /><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
            }),
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => "");
            console.error("[contact] Resend responded", res.status, detail);
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
