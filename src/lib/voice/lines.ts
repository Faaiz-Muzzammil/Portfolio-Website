import { personalInfo } from "@/data";

/**
 * Every sentence the voice assistant is capable of saying.
 *
 * ── WHY THIS IS A SHARED MODULE AND NOT A LIST IN THE COMPONENT ──────
 *
 * `/api/tts` proxies ElevenLabs using a server-held API key. Before this
 * existed the route accepted any string up to 200 characters and spoke
 * it, which made it a free text-to-speech API with somebody else's
 * credentials attached — a `curl` loop against it is not a bug in the
 * assistant, it is the endpoint working as written. Rate limiting caps
 * how *fast* that costs money; it does not stop it being possible, and
 * an attacker with a handful of IPs has a generous budget.
 *
 * The assistant only ever speaks from a fixed script. Nothing a visitor
 * says is ever synthesised — recognition input picks *which* line to
 * play, it never becomes the line. So the server can require that the
 * text is one of these exact strings, and the endpoint stops being
 * useful for anything but this site.
 *
 * IT LIVES IN `lib/` SO BOTH SIDES IMPORT THE SAME OBJECT. A copy of
 * the list in the route would be a second list that has to agree with
 * the first, and the failure mode is silent: reword a line in the
 * component, forget the route, and that one reply goes mute in
 * production while every other line still works.
 *
 * ADDING A LINE MEANS ADDING IT HERE. If a new `speak()` call is given
 * a literal instead of a member of this object, the server will reject
 * it with 400 and the assistant will fall back to the platform voice —
 * which is a degradation rather than a break, but it is still wrong.
 *
 * Every value has to be a compile-time constant for the allowlist to
 * work, and they all are: the two that interpolate read from
 * `personalInfo`, which is static data, so they resolve at module load.
 */
export const VOICE_LINES = {
    greeting: "Hi! How can I help you today?",
    goodbye: "Goodbye!",

    // Navigation
    home: "Going to home.",
    work: "Navigating to projects.",
    experience: "Showing experience section.",
    stack: "Each project lists what it was built with — here they are.",
    contact: "Taking you to the contact form.",

    // Q&A
    whoAreYou: `I am an AI assistant for ${personalInfo.name}. He is a ${personalInfo.role}.`,
    whatDoYouDo:
        "I help you navigate this portfolio and answer questions about Faaiz's work.",
    availability: personalInfo.available
        ? "Yes, Faaiz is currently available for new projects."
        : "Faaiz is currently busy, but you can always reach out.",
    hello: "Hello there! How can I help you navigate today?",

    // Theme
    toLight: "Switching to light mode.",
    toDark: "Switching to dark mode.",

    // Failure states. These are spoken too, so they need to be here or
    // the one moment the assistant is explaining itself is the moment it
    // cannot speak.
    micBlocked:
        "Microphone access is blocked. Allow it in your browser settings to use voice.",
    micNotFound: "No microphone found.",
    micFailed: "Could not access microphone.",
    micLost: "I lost the microphone. Tap the mic to try again.",
    insecure: "Voice commands need a secure HTTPS connection.",
    unsupportedIOS:
        "Voice commands aren't supported by browsers on iPhone or iPad. Everything here is reachable by scrolling, and the contact form is at the foot of the page.",
    unsupported:
        "This browser doesn't support voice commands. Try Chrome or Edge, or just scroll — everything is reachable without me.",
    notUnderstood: "I didn't catch that. Try \"go to work\" or \"contact\".",
} as const;

export type VoiceLine = (typeof VOICE_LINES)[keyof typeof VOICE_LINES];

/** The allowlist, as a set, for the route's membership check. */
export const VOICE_LINE_SET: ReadonlySet<string> = new Set(
    Object.values(VOICE_LINES),
);

/**
 * The longest line, so the route's length cap is derived rather than
 * guessed. A hard-coded 200 was both too generous — it allowed a
 * payload three times the longest real line — and a trap, since a
 * longer line added here would have started failing validation.
 */
export const MAX_LINE_LENGTH = Math.max(
    ...Object.values(VOICE_LINES).map((line) => line.length),
);
