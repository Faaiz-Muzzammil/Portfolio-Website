import { NextRequest, NextResponse } from 'next/server';

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================
const MAX_REQUESTS_PER_SESSION = 30;  // Increased for better UX
const COOLDOWN_MS = 2000;  // Reduced cooldown between requests
const MAX_CHARACTERS = 200;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const rateLimitStore = new Map<string, { count: number; lastRequest: number; windowStart: number }>();

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; message: string; remaining: number } {
    const now = Date.now();
    const data = rateLimitStore.get(ip);

    if (!data) {
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
        const ip = getClientIP(request);
        const rateCheck = checkRateLimit(ip);

        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: rateCheck.message, remaining: rateCheck.remaining },
                { status: 429, headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) } }
            );
        }

        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length > MAX_CHARACTERS) {
            return NextResponse.json({ error: `Text exceeds ${MAX_CHARACTERS} chars` }, { status: 400 });
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
