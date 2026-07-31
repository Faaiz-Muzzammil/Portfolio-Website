import { NextRequest, NextResponse } from 'next/server';
import { VOICE_LINE_SET, MAX_LINE_LENGTH } from '@/lib/voice/lines';

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================
const MAX_REQUESTS_PER_SESSION = 30;
const COOLDOWN_MS = 2000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/* How many IPs the store will hold before it starts evicting. The Map
   had no bound at all: one entry per IP that ever called, held for the
   life of the serverless instance, never removed even after its window
   had long expired. On a warm instance that is a slow leak, and it is
   also the cheapest possible attack on this route — spray requests from
   many addresses and the memory is the thing that gives way, not the
   rate limiter. */
const MAX_TRACKED_IPS = 5000;

const rateLimitStore = new Map<string, { count: number; lastRequest: number; windowStart: number }>();

/* Drop entries whose window has expired. Called on write, so the cost
   is paid by the traffic that causes the growth, and only when the
   store is actually large. */
function evictStale(now: number) {
    if (rateLimitStore.size < MAX_TRACKED_IPS) return;

    for (const [key, entry] of rateLimitStore) {
        if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
            rateLimitStore.delete(key);
        }
    }

    /* Still full — every entry is inside its window, which means this is
       a spray rather than organic traffic. Drop the oldest quarter;
       Map iterates in insertion order, so this takes the least recently
       created buckets first. */
    if (rateLimitStore.size >= MAX_TRACKED_IPS) {
        const excess = Math.ceil(MAX_TRACKED_IPS / 4);
        let dropped = 0;
        for (const key of rateLimitStore.keys()) {
            rateLimitStore.delete(key);
            if (++dropped >= excess) break;
        }
    }
}

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; message: string; remaining: number } {
    const now = Date.now();
    const data = rateLimitStore.get(ip);

    if (!data) {
        evictStale(now);
        rateLimitStore.set(ip, { count: 1, lastRequest: now, windowStart: now });
        return { allowed: true, message: '', remaining: MAX_REQUESTS_PER_SESSION - 1 };
    }

    if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(ip, { count: 1, lastRequest: now, windowStart: now });
        return { allowed: true, message: '', remaining: MAX_REQUESTS_PER_SESSION - 1 };
    }

    if (now - data.lastRequest < COOLDOWN_MS) {
        const waitTime = Math.ceil((COOLDOWN_MS - (now - data.lastRequest)) / 1000);
        return { allowed: false, message: `Please wait ${waitTime}s`, remaining: MAX_REQUESTS_PER_SESSION - data.count };
    }

    if (data.count >= MAX_REQUESTS_PER_SESSION) {
        return { allowed: false, message: 'Rate limit reached', remaining: 0 };
    }

    data.count++;
    data.lastRequest = now;
    rateLimitStore.set(ip, data);
    return { allowed: true, message: '', remaining: MAX_REQUESTS_PER_SESSION - data.count };
}

export async function POST(request: NextRequest) {
    try {
        /* ---- VALIDATE BEFORE SPENDING THE RATE LIMIT ------------------
           Order matters. Validation used to run *after* `checkRateLimit`,
           which meant a malformed or disallowed request still consumed
           one of a real visitor's thirty — so an attacker could exhaust
           a shared NAT's budget with garbage that was never going to be
           synthesised. Rejecting first costs nothing and cannot be used
           to deny anyone else service. */

        /* Reject anything that is not a JSON POST outright. A form post
           from another origin cannot set this header, so requiring it is
           a CSRF guard as well as a sanity check. */
        const contentType = request.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json({ error: 'Expected application/json' }, { status: 415 });
        }

        /* Bound the body before parsing it. Without this a multi-megabyte
           payload is fully read and parsed before the length check below
           ever sees it. */
        const declared = Number(request.headers.get('content-length') ?? 0);
        if (declared > 4096) {
            return NextResponse.json({ error: 'Body too large' }, { status: 413 });
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
        }

        const text = (body as { text?: unknown })?.text;

        if (typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length > MAX_LINE_LENGTH) {
            return NextResponse.json(
                { error: `Text exceeds ${MAX_LINE_LENGTH} chars` },
                { status: 400 },
            );
        }

        /* ---- THE ALLOWLIST, WHICH IS THE ACTUAL PROTECTION ------------
           This route holds an ElevenLabs key. Accepting arbitrary text
           made it a free TTS API with somebody else's billing attached,
           and no rate limit fixes that — it only decides how quickly the
           bill arrives.

           The assistant speaks from a fixed script and nothing a visitor
           says is ever synthesised, so the text has to be one of the
           known lines. See `lib/voice/lines.ts`; both sides import it,
           so there is no second list to drift.

           `no-store` on the 400 so a probing client cannot use cache
           behaviour to map the allowlist. */
        if (!VOICE_LINE_SET.has(text)) {
            return NextResponse.json(
                { error: 'Unrecognised phrase', fallback: true },
                { status: 400, headers: { 'Cache-Control': 'no-store' } },
            );
        }

        const ip = getClientIP(request);
        const rateCheck = checkRateLimit(ip);

        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: rateCheck.message, remaining: rateCheck.remaining },
                { status: 429, headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) } }
            );
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            return NextResponse.json({ error: 'TTS not configured', fallback: true }, { status: 503 });
        }

        const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';

        // Use raw fetch API for better serverless compatibility
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_flash_v2_5',
                output_format: 'mp3_22050_32',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs error:', response.status, errorText);
            return NextResponse.json({ error: 'TTS failed', fallback: true }, { status: 500 });
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': String(audioBuffer.byteLength),
                'X-RateLimit-Remaining': String(rateCheck.remaining),
                'Cache-Control': 'no-store',
            },
        });

    } catch (error: any) {
        console.error('TTS error:', error?.message || error);
        return NextResponse.json({ error: 'TTS failed', fallback: true }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        service: 'ElevenLabs TTS',
        model: 'eleven_flash_v2_5',
        status: process.env.ELEVENLABS_API_KEY ? 'configured' : 'not_configured',
    });
}
