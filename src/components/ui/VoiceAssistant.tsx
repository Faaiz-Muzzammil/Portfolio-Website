"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Microphone, SpeakerHigh, X } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { VOICE_LINES } from "@/lib/voice/lines";

// TypeScript definition for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

interface VoiceAssistantProps {
    onNavigate?: (sectionId: string) => void;
    onStateChange?: (isActive: boolean) => void;
}

const HINTS = [
    "Go to projects",
    "Who are you?",
    "Contact Faaiz",
    "Show experience",
    "What's your tech stack?",
    "Go home",
    "Switch to dark mode",
    "Stop listening",
];

// Detect mobile/iOS for platform-specific handling - cached
let cachedIsMobile: boolean | null = null;
let cachedIsIOS: boolean | null = null;
let cachedIsAndroid: boolean | null = null;

const isMobile = (): boolean => {
    if (typeof window === "undefined") return false;
    if (cachedIsMobile === null) {
        cachedIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return cachedIsMobile;
};

const isIOS = (): boolean => {
    if (typeof window === "undefined") return false;
    if (cachedIsIOS === null) {
        cachedIsIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }
    return cachedIsIOS;
};

const isAndroid = (): boolean => {
    if (typeof window === "undefined") return false;
    if (cachedIsAndroid === null) {
        cachedIsAndroid = /Android/i.test(navigator.userAgent);
    }
    return cachedIsAndroid;
};

/* ---- WHY iOS CANNOT HOLD A CONTINUOUS SESSION ----------------------
 * WebKit requires a user gesture for *every* `recognition.start()`, not
 * just the first one in a session. Android and desktop Chrome only
 * require the first, which is what makes a hands-free loop possible
 * there: the reply finishes, a timer fires, recognition restarts, and
 * the reader keeps talking.
 *
 * On iOS that timer is not a gesture. `start()` from it does nothing —
 * no `onstart`, no `onerror`, no `onend`, no exception to catch. The
 * call is simply ignored. So the loop was: tap, first command works,
 * reply plays, restart is silently dropped, and the panel sits on
 * "Listening" forever with a microphone that was never opened. Exactly
 * one command per tap, which is what the bug report described.
 *
 * NO AMOUNT OF RETRY LOGIC FIXES THIS, and the watchdog added for the
 * desktop hang made it worse rather than better here: it kept retrying
 * a call that can never succeed, on a two-second cycle, forever.
 *
 * So iOS gets the interaction model it actually supports — one tap,
 * one command — and the panel says so. `isIOS()` rather than a feature
 * test because there is nothing to test: the failure is silence, and by
 * the time it can be observed the turn is already lost.
 */
const needsGesturePerTurn = (): boolean => isIOS();

export default function VoiceAssistant({ onNavigate, onStateChange }: VoiceAssistantProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [response, setResponse] = useState("");
    const [hintIndex, setHintIndex] = useState(0);
    const [isSupported, setIsSupported] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [micPermissionGranted, setMicPermissionGranted] = useState(false);
    const [ttsRemaining, setTtsRemaining] = useState<number | null>(null);

    /* The panel is open and the turn is over, waiting on a tap to start
       the next one. Only ever true where `needsGesturePerTurn()` is —
       see the note beside it. It keeps the session on screen between
       turns so the reader is not returned to a bare microphone button
       after every command. */
    const [awaitingTurn, setAwaitingTurn] = useState(false);

    const { setTheme, theme } = useTheme();

    // Refs for stable state tracking
    const shouldListenRef = useRef(false);
    const hasGreetedRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const voicesLoadedRef = useRef(false);
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionActiveRef = useRef(false);
    const retryCountRef = useRef(0);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    /* ---- THE LATEST-HANDLER REFS, AND WHY THEY ARE NOT OPTIONAL -----
       The recognition object is built once, in an effect that must not
       re-run — rebuilding it mid-session tears down a live microphone —
       so its `onresult` and `onerror` callbacks are created exactly once
       and live for the page's lifetime. Those callbacks were calling
       `handleCommand` and `speak` directly, which meant they captured
       the *first render's* copies and kept them forever.

       That is not a theoretical staleness. `handleCommand` closes over
       `theme` from `useTheme()`, so "toggle theme" read whatever the
       theme was when the component first mounted and flipped away from
       that every single time — say it twice and the second one did
       nothing. Everything downstream of `speak` was equally frozen.

       A ref reassigned on every render is the standard fix: the effect
       reads `.current` at call time, so it always gets the newest
       closure while the recognition object itself is never rebuilt. */
    const handleCommandRef = useRef<(cmd: string) => void>(() => { });
    const speakRef = useRef<(text: string) => void>(() => { });
    const persistentAudioRef = useRef<HTMLAudioElement | null>(null);  // iOS: single primed element
    const iosAudioPrimedRef = useRef(false);  // iOS: track if audio is primed
    /* ---- WHEN TO STOP ASKING ELEVENLABS ------------------------------
       `useElevenLabsRef` was set true and never written again, so a
       deployment with no `ELEVENLABS_API_KEY`, or one that had burned
       its rate limit, paid the full remote round trip on every single
       utterance and then fell back — and on a hard failure that is a
       ten-second timeout before the reply starts. Every command. For
       the whole session.

       Two consecutive failures is enough to conclude the service is not
       available right now; after that the session uses the platform
       voice, which is instant. The counter resets on any success, so a
       single flaky request does not cost the rest of the visit. */
    const useElevenLabsRef = useRef(true);
    const ttsFailuresRef = useRef(0);

    /* Consecutive restarts that produced no speech. Reset by any real
       result; see `recognition.onend` for what it is guarding against. */
    const restartsRef = useRef(0);

    const MAX_RETRIES = 3;
    const MAX_TTS_FAILURES = 2;
    const MAX_DEAD_RESTARTS = 6;

    // Broadcast state changes
    useEffect(() => {
        onStateChange?.(isListening || isSpeaking);
    }, [isListening, isSpeaking, onStateChange]);

    /* Detect mobile and pre-check mic permission.

       AN `AudioContext` WAS BEING CONSTRUCTED HERE ON EVERY PAGE LOAD
       and it is gone. Nothing ever used it: playback goes through an
       `<audio>` element, and the context was only ever created,
       resumed once, and closed on unmount. Every visitor to the site —
       including the overwhelming majority who never touch the mic —
       was paying to spin up an audio graph, and on Chrome and Safari an
       `AudioContext` built outside a user gesture starts `suspended`
       and logs a warning about it. A cost and a console warning, for a
       thing with no consumer. */
    useEffect(() => {
        setIsMobileDevice(isMobile());

        // Pre-check microphone permission status (non-blocking)
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' as PermissionName }).then(result => {
                setMicPermissionGranted(result.state === 'granted');
                result.onchange = () => {
                    setMicPermissionGranted(result.state === 'granted');
                };
            }).catch(() => {
                // Permissions API not fully supported, will check on first use
            });
        }
    }, []);

    // Rotate hints
    useEffect(() => {
        if (isListening && !transcript && !response) {
            const interval = setInterval(() => {
                setHintIndex((prev) => (prev + 1) % HINTS.length);
            }, isMobileDevice ? 4000 : 3000);
            return () => clearInterval(interval);
        }
    }, [isListening, transcript, response, isMobileDevice]);

    /* ---- ONE WAY TO SILENCE IT --------------------------------------
       There are two independent things that can be making noise — an
       `<audio>` element playing an ElevenLabs clip, and the platform's
       own `speechSynthesis` — and before this they were being stopped
       in different places by different code. `Escape` cancelled
       `speechSynthesis` and left the audio element playing, so the one
       guaranteed way out of a live session did not actually stop the
       voice. Unmount had the mirror problem.

       Everything that ends a session calls this now. `pause()` alone
       leaves the element holding a decoded buffer and a blob URL, so
       the source is cleared and the URL revoked as well — a session
       that gets opened and closed a dozen times should not accumulate
       a dozen decoded clips. */
    const stopAllAudio = useCallback(() => {
        const audio = currentAudioRef.current;
        if (audio) {
            audio.pause();
            /* Revoking before clearing `src` is the wrong order — the
               element still holds the URL until the source is dropped. */
            const url = audio.src;
            audio.removeAttribute("src");
            audio.load();
            if (url.startsWith("blob:")) URL.revokeObjectURL(url);
            currentAudioRef.current = null;
        }

        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);

    // Cleanup on unmount: timers, audio, and the microphone itself.
    useEffect(() => {
        return () => {
            shouldListenRef.current = false;
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
            if (startWatchdogRef.current) clearTimeout(startWatchdogRef.current);
            startingRef.current = false;
            stopAllAudio();
            /* The recognition object was left running on unmount, which
               on Android holds the mic indicator up after the component
               is gone. `abort()` rather than `stop()`: there is no
               result worth waiting for. */
            try {
                recognitionRef.current?.abort();
            } catch { /* already stopped */ }
            recognitionActiveRef.current = false;
        };
    }, [stopAllAudio]);

    // Load voices (fallback)
    const loadVoices = useCallback(() => {
        if (!synthRef.current) return;
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
            voicesLoadedRef.current = true;
        }
    }, []);

    /* ---- STARTING, AND THE LIE THAT KILLED THE SECOND COMMAND -------
       THE BUG THIS REPLACES. `recognitionActiveRef` was written
       optimistically here — set to `true` immediately after calling
       `start()`, and set to `true` again in the `catch` whenever the
       engine said "already started". Both are guesses about a state
       only the engine knows, and the second one is a guess that is
       wrong in exactly the case it fires.

       The sequence that broke it: `speak()` calls `abort()` to free the
       microphone, and `abort()` tears down asynchronously — `onend`
       arrives a few frames later. When the reply finished quickly, the
       restart in `onSpeechEnd` ran *during* that teardown, `start()`
       threw, and the catch recorded `active = true` for a recognition
       object that was in the middle of stopping. From then on every
       call to this function hit `if (recognitionActiveRef.current)
       return true` and returned without starting anything. The panel
       kept saying "Listening" because nothing ever set it false, and no
       result ever arrived again. One command worked; the next never
       did.

       THE RULE NOW: `recognitionActiveRef` is written only by the
       engine's own events — `onstart` sets it, `onend` clears it. This
       function never asserts it. A throw means the start did not
       happen, so it is treated as a failure and retried once the engine
       has had time to settle, rather than being recorded as success.

       `startingRef` covers the gap between calling `start()` and
       `onstart` arriving, so two paths racing to restart — the one in
       `onSpeechEnd` and the one in `onend` — cannot both get through.

       THE WATCHDOG IS THE BACKSTOP. If `onstart` never arrives, no
       event will ever clear `startingRef` and the session would hang in
       the same way for a different reason. Anything that has not
       started within two seconds is treated as dead and retried. */
    const startWatchdogRef = useRef<NodeJS.Timeout | null>(null);
    const startingRef = useRef(false);
    const startFnRef = useRef<() => boolean>(() => false);

    const safeStartRecognition = useCallback((): boolean => {
        if (!recognitionRef.current) return false;
        if (recognitionActiveRef.current || startingRef.current) return true;
        if (isSpeakingRef.current) return false;
        if (!shouldListenRef.current) return false;

        startingRef.current = true;

        try {
            recognitionRef.current.start();
            retryCountRef.current = 0;

            if (startWatchdogRef.current) clearTimeout(startWatchdogRef.current);
            startWatchdogRef.current = setTimeout(() => {
                if (!startingRef.current) return;
                // `onstart` never came. Assume nothing is running.
                startingRef.current = false;
                recognitionActiveRef.current = false;
                try { recognitionRef.current?.abort(); } catch { /* already down */ }
                if (shouldListenRef.current && !isSpeakingRef.current) {
                    startFnRef.current();
                }
            }, 2000);

            return true;
        } catch {
            /* Mid-teardown. Not a success — clear the latch, force the
               engine down so the next `start()` has a clean object, and
               come back once it has settled. */
            startingRef.current = false;
            recognitionActiveRef.current = false;

            try { recognitionRef.current.abort(); } catch { /* already down */ }

            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = setTimeout(() => {
                if (shouldListenRef.current && !isSpeakingRef.current) {
                    startFnRef.current();
                }
            }, 400);

            return false;
        }
    }, []);

    // The retries above call through this so they always get the current
    // function without making it a dependency of itself.
    useEffect(() => {
        startFnRef.current = safeStartRecognition;
    }, [safeStartRecognition]);

    // Safe recognition stop
    const safeStopRecognition = useCallback((abort = false) => {
        if (startWatchdogRef.current) {
            clearTimeout(startWatchdogRef.current);
            startWatchdogRef.current = null;
        }
        startingRef.current = false;

        if (!recognitionRef.current) return;

        try {
            if (abort) {
                recognitionRef.current.abort();
            } else {
                recognitionRef.current.stop();
            }
        } catch { /* ignore */ }

        /* Deliberately NOT setting `recognitionActiveRef = false` here.
           The engine is still running until `onend` fires, and claiming
           otherwise is the same class of lie that broke the restart —
           it would let a start slip through while the old session is
           still tearing down. `onend` clears it. */
    }, []);

    // Escape closes the session. The command bar covers the nav while open,
    // so there has to be a keyboard way out of it.
    useEffect(() => {
        if (!isListening && !isSpeaking) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            shouldListenRef.current = false;
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            safeStopRecognition(true);
            setIsListening(false);
            /* `stopAllAudio`, not `speechSynthesis.cancel()`. Escape used
               to silence the platform voice and leave an ElevenLabs clip
               playing to the end — which is most of the time, since
               ElevenLabs is tried first. */
            stopAllAudio();
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            setResponse("");
            setTranscript("");
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isListening, isSpeaking, safeStopRecognition, stopAllAudio]);

    // Initialize Speech API
    useEffect(() => {
        if (typeof window !== "undefined") {
            const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
            const SpeechRecognitionObj = SpeechRecognition || webkitSpeechRecognition;

            if (!SpeechRecognitionObj) {
                if (isIOS()) {
                    console.log("iOS detected: Speech recognition not supported");
                }
                setIsSupported(false);
            } else {
                const recognition = new SpeechRecognitionObj();

                // Mobile settings
                if (isMobile()) {
                    recognition.continuous = false;
                    recognition.interimResults = false;
                } else {
                    recognition.continuous = true;
                    recognition.interimResults = true;
                }

                recognition.lang = "en-US";
                recognition.maxAlternatives = 1;

                /* The engine confirming it is live. This and `onend` are
                   the only two places `recognitionActiveRef` is written;
                   see the note on `safeStartRecognition`. */
                recognition.onstart = () => {
                    startingRef.current = false;
                    if (startWatchdogRef.current) {
                        clearTimeout(startWatchdogRef.current);
                        startWatchdogRef.current = null;
                    }
                    recognitionActiveRef.current = true;
                    setIsListening(true);
                };

                recognition.onerror = (event: any) => {
                    /* A start that errors never reaches `onstart`, so the
                       latch has to be released here too. `onend` follows
                       every error and would also clear it, but relying on
                       that is how the session hangs when it does not. */
                    startingRef.current = false;
                    if (startWatchdogRef.current) {
                        clearTimeout(startWatchdogRef.current);
                        startWatchdogRef.current = null;
                    }

                    if (event.error === 'aborted' || event.error === 'no-speech') {
                        return;
                    }

                    if (event.error === 'network') {
                        recognitionActiveRef.current = false;

                        if (shouldListenRef.current && isMobile() && retryCountRef.current < MAX_RETRIES) {
                            retryCountRef.current++;
                            const delay = Math.min(500 * Math.pow(2, retryCountRef.current - 1), 2000);

                            restartTimeoutRef.current = setTimeout(() => {
                                if (shouldListenRef.current && !isSpeakingRef.current) {
                                    safeStartRecognition();
                                }
                            }, delay);
                        }
                    } else if (event.error === 'not-allowed') {
                        shouldListenRef.current = false;
                        recognitionActiveRef.current = false;
                        setIsListening(false);
                        setMicPermissionGranted(false);
                        speakRef.current(VOICE_LINES.micBlocked);
                    } else if (event.error === 'service-not-allowed') {
                        shouldListenRef.current = false;
                        recognitionActiveRef.current = false;
                        setIsListening(false);
                    } else {
                        recognitionActiveRef.current = false;
                        if (!shouldListenRef.current) {
                            setIsListening(false);
                        }
                    }
                };

                /* ---- THE RESTART, AND ITS CEILING -------------------
                   Recognition is `continuous = false` on mobile, so it
                   ends after every utterance and has to be restarted for
                   the session to feel continuous. That restart had no
                   limit and no memory: if the engine ended immediately —
                   a revoked permission, a browser that stops honouring
                   `start()` without a fresh gesture, an Android build
                   with no network to its recognition service — `onend`
                   fired, rescheduled, started, ended immediately, and
                   went round again. Three times a second, forever, with
                   the panel showing "Listening" the entire time.

                   `restartsRef` counts starts that produced nothing. A
                   real utterance resets it in `onresult`. Six dead
                   restarts is the point at which the session is not
                   coming back, so it closes and says so — which is a
                   fixable answer, unlike a spinner that never resolves. */
                recognition.onend = () => {
                    recognitionActiveRef.current = false;
                    startingRef.current = false;
                    if (startWatchdogRef.current) {
                        clearTimeout(startWatchdogRef.current);
                        startWatchdogRef.current = null;
                    }

                    if (!shouldListenRef.current || isSpeakingRef.current) {
                        if (!shouldListenRef.current) setIsListening(false);
                        return;
                    }

                    /* iOS: the turn is over and only a tap can open the
                       next one. Restarting here is the call that gets
                       silently dropped, so it hands off to the panel
                       instead of spinning. */
                    if (needsGesturePerTurn()) {
                        setIsListening(false);
                        setAwaitingTurn(true);
                        return;
                    }

                    restartsRef.current += 1;

                    if (restartsRef.current > MAX_DEAD_RESTARTS) {
                        shouldListenRef.current = false;
                        restartsRef.current = 0;
                        setIsListening(false);
                        speakRef.current(VOICE_LINES.micLost);
                        return;
                    }

                    const delay = isMobile() ? 300 : 100;

                    restartTimeoutRef.current = setTimeout(() => {
                        if (shouldListenRef.current && !isSpeakingRef.current && !recognitionActiveRef.current) {
                            safeStartRecognition();
                        }
                    }, delay);
                };

                recognition.onresult = (event: any) => {
                    /* `handleCommandRef`, never `handleCommand` — this
                       callback is created once and outlives every render.
                       See the note beside the ref declarations. */
                    if (isMobile()) {
                        /* `event.results[0]` is wrong once a session has
                           produced more than one result, which happens on
                           Android whenever recognition restarts without
                           the results list being reset: the second
                           utterance re-runs the *first* command. Index
                           from `resultIndex`, which is what the event
                           carries precisely to say "this is the new
                           part". */
                        const idx = typeof event.resultIndex === "number"
                            ? event.resultIndex
                            : event.results.length - 1;
                        const result = event.results[idx];
                        if (!result) return;

                        // A real utterance: the session is alive.
                        restartsRef.current = 0;

                        const text = result[0].transcript;
                        setTranscript(text);
                        handleCommandRef.current(text.toLowerCase());
                    } else {
                        restartsRef.current = 0;

                        const lastResult = event.results[event.results.length - 1];
                        const text = lastResult[0].transcript;
                        setTranscript(text);

                        if (lastResult.isFinal) {
                            handleCommandRef.current(text.toLowerCase());
                        }
                    }
                };

                recognitionRef.current = recognition;
            }

            synthRef.current = window.speechSynthesis;

            if (synthRef.current) {
                loadVoices();
                synthRef.current.onvoiceschanged = loadVoices;
            }
        }
    }, [loadVoices, safeStartRecognition]);

    // Get best voice for browser TTS (fallback)
    const getBestVoice = useCallback(() => {
        if (!synthRef.current) return null;
        const voices = synthRef.current.getVoices();

        if (isIOS()) {
            return voices.find(v => v.name.includes("Samantha")) ||
                voices.find(v => v.lang.startsWith("en") && v.localService) ||
                voices.find(v => v.lang.startsWith("en")) ||
                voices[0];
        } else if (isAndroid()) {
            return voices.find(v => v.name.includes("Google") && v.lang.includes("en")) ||
                voices.find(v => v.lang.startsWith("en-US")) ||
                voices.find(v => v.lang.startsWith("en")) ||
                voices[0];
        } else {
            return voices.find(v => v.name.includes("Google US English")) ||
                voices.find(v => v.name.includes("Samantha")) ||
                voices.find(v => v.lang.startsWith("en-US")) ||
                voices[0];
        }
    }, []);

    // Browser TTS fallback
    const speakWithBrowser = useCallback((text: string, onEnd?: () => void) => {
        if (!synthRef.current) {
            onEnd?.();
            return;
        }

        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = isMobile() ? 0.95 : 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voice = getBestVoice();
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            onEnd?.();
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            onEnd?.();
        };

        synthRef.current.speak(utterance);
    }, [getBestVoice]);

    // ElevenLabs TTS with iOS-compatible audio handling
    const speakWithElevenLabs = useCallback(async (text: string): Promise<boolean> => {
        // CRITICAL: Kill any native speech synthesis before doing anything
        // iOS auto-activates speechSynthesis when SpeechRecognition was active
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        // Timeout protection to prevent getting stuck
        const timeoutPromise = new Promise<boolean>((resolve) => {
            setTimeout(() => {
                console.warn('ElevenLabs TTS timeout - falling back');
                resolve(false);
            }, 10000); // 10 second timeout
        });

        const ttsPromise = (async (): Promise<boolean> => {
            try {
                // Cancel native speech again right before fetch
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }

                const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: text.slice(0, 200) }),
                });

                const remaining = response.headers.get('X-RateLimit-Remaining');
                if (remaining !== null) {
                    setTtsRemaining(parseInt(remaining, 10));
                }

                if (!response.ok) {
                    const data = await response.json();
                    if (response.status === 429) {
                        setResponse(data.message || 'Rate limit reached');
                    }
                    return false;
                }

                // Cancel native speech again right before playing
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // CRITICAL: Reuse primed audio element on iOS
                const audio = (isIOS() && persistentAudioRef.current)
                    ? persistentAudioRef.current
                    : new Audio();

                audio.preload = 'auto';
                audio.src = audioUrl;
                currentAudioRef.current = audio;

                return new Promise<boolean>((resolve) => {
                    let resolved = false;
                    let playStarted = false;

                    const finish = (success: boolean) => {
                        if (resolved) return;
                        resolved = true;
                        URL.revokeObjectURL(audioUrl);
                        resolve(success);
                    };

                    /* ONE PLAY, NOT TWO. Both `loadeddata` and
                       `canplaythrough` were calling `play()`, and on a
                       clip small enough to buffer in one go both fire —
                       the second call restarts a stream that has already
                       begun, which is the stutter at the top of a reply.
                       `canplaythrough` alone is not enough either: some
                       Android builds never fire it for a short blob, so
                       both listeners stay and a latch decides. */
                    const startPlayback = () => {
                        if (resolved || playStarted) return;
                        playStarted = true;

                        /* iOS re-arms `speechSynthesis` on its own once
                           SpeechRecognition has run in the session, so it
                           is cancelled as late as possible — any earlier
                           and it can wake up again between the cancel and
                           the play, and the reply is spoken twice in two
                           different voices. */
                        if (window.speechSynthesis) window.speechSynthesis.cancel();

                        audio.play().catch((e) => {
                            console.error('Audio play failed:', e);
                            finish(false);
                        });
                    };

                    audio.onended = () => finish(true);
                    audio.onerror = () => finish(false);
                    audio.oncanplaythrough = startPlayback;
                    audio.onloadeddata = startPlayback;

                    audio.load();
                });

            } catch (error) {
                console.error('ElevenLabs TTS error:', error);
                return false;
            }
        })();

        /* Race between TTS and timeout, then keep score. Two failures in
           a row and the rest of the session goes straight to the
           platform voice rather than paying the round trip — and the
           timeout is the expensive failure, so this matters most exactly
           when the service is worst. */
        const ok = await Promise.race([ttsPromise, timeoutPromise]);

        if (ok) {
            ttsFailuresRef.current = 0;
        } else {
            ttsFailuresRef.current += 1;
            if (ttsFailuresRef.current >= MAX_TTS_FAILURES) {
                useElevenLabsRef.current = false;
                console.warn(
                    `ElevenLabs failed ${MAX_TTS_FAILURES}x — using the platform voice for the rest of this session`,
                );
            }
        }

        return ok;
    }, []);

    // Main speak function (tries ElevenLabs first, falls back to browser)
    const speak = useCallback(async (text: string) => {
        // Set state immediately to prevent "inactive" gap
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setResponse(text);
        setTranscript("");

        // Stop any current audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }

        if (synthRef.current) {
            synthRef.current.cancel();
        }

        if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
        }

        // Stop recognition while speaking
        if (recognitionActiveRef.current && recognitionRef.current) {
            safeStopRecognition(true);
        }

        const onSpeechEnd = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            setTimeout(() => setResponse(""), 2000);

            if (shouldListenRef.current && recognitionRef.current) {
                /* iOS: hand the next turn to a tap. The timer below is
                   not a user gesture, and WebKit ignores `start()`
                   outside one — see `needsGesturePerTurn`. */
                if (needsGesturePerTurn()) {
                    setIsListening(false);
                    setAwaitingTurn(true);
                    return;
                }

                const delay = isMobile() ? 400 : 100;
                restartTimeoutRef.current = setTimeout(() => {
                    if (shouldListenRef.current && !isSpeakingRef.current) {
                        safeStartRecognition();
                    }
                }, delay);
            } else {
                setIsListening(false);
            }
        };

        /* Try ElevenLabs, then the platform voice.

           iOS USED TO GET NO FALLBACK AT ALL — on a failure it called
           `onSpeechEnd()` and said nothing, on the reasoning that
           switching voices mid-session is jarring. It is, and it is also
           far better than the alternative that was shipping: with no
           API key, a rate limit hit, or one bad network moment, the
           assistant on iPhone went permanently and silently mute while
           still showing "Speaking" in the panel. A different voice is a
           blemish; no voice is a broken feature. */
        if (useElevenLabsRef.current) {
            const success = await speakWithElevenLabs(text);
            if (success) {
                onSpeechEnd();
                return;
            }
        }

        speakWithBrowser(text, onSpeechEnd);

    }, [speakWithElevenLabs, speakWithBrowser, safeStartRecognition, safeStopRecognition]);

    // Speak and close
    const speakAndClose = useCallback(async (text: string) => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setResponse(text);
        setTranscript("");

        shouldListenRef.current = false;
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
        }

        safeStopRecognition(true);
        setIsListening(false);

        // Stop any current audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }

        if (synthRef.current) {
            synthRef.current.cancel();
        }

        const onEnd = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            setResponse("");
        };

        // Try ElevenLabs first
        if (useElevenLabsRef.current) {
            const success = await speakWithElevenLabs(text);
            if (success) {
                onEnd();
                return;
            }
        }

        // Same fallback as `speak` — see the note there on why iOS is
        // no longer excluded.
        setTimeout(() => {
            speakWithBrowser(text, onEnd);
        }, 50);

    }, [speakWithElevenLabs, speakWithBrowser, safeStopRecognition]);

    const handleCommand = useCallback((raw: string) => {
        /* ---- VALIDATE THE TRANSCRIPT BEFORE MATCHING ON IT -----------
           Recognition output is untrusted input. It arrives from a
           remote service, it is shaped by whatever noise was in the
           room, and on Android a poor connection can deliver a single
           "result" hundreds of characters long — a stretch of a podcast
           playing nearby, a conversation across the room.

           None of it is ever synthesised or rendered as markup, so
           there is no injection surface here; what these guards prevent
           is worse-behaved matching. `cmd.includes("work")` against a
           four-hundred-character transcript will find "work" in almost
           anything, so long input does not fail to match — it matches
           *everything*, and the first branch wins. The assistant appears
           to respond confidently to speech that was never aimed at it.

           NORMALISE, THEN BOUND, THEN MATCH:
             · collapse whitespace, so " go   to  work " behaves;
             · strip anything that is not a letter, digit, space or
               apostrophe — recognition emits stray punctuation that
               breaks `includes` on multi-word phrases;
             · drop anything under two characters as noise;
             · drop anything over the length of a plausible command.
               Real ones here are under forty characters; eighty is
               generous and still far short of ambient speech. */
        const cmd = raw
            .toLowerCase()
            .replace(/[^a-z0-9\s']/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        if (cmd.length < 2 || cmd.length > 80) return;

        // --- STOP/CANCEL COMMANDS ---
        if (cmd.includes("cancel") || cmd.includes("stop") || cmd.includes("close") || cmd.includes("bye")) {
            speakAndClose(VOICE_LINES.goodbye);
            return;
        }

        // --- NAVIGATION COMMANDS ---
        else if (cmd.includes("home") || cmd.includes("start")) {
            speak(VOICE_LINES.home);
            navigateTo("#home");
        }
        else if (cmd.includes("project") || cmd.includes("work") || cmd.includes("portfolio")) {
            speak(VOICE_LINES.work);
            navigateTo("#work");
        }
        else if (cmd.includes("experience") || cmd.includes("job") || cmd.includes("career")) {
            speak(VOICE_LINES.experience);
            navigateTo("#experience");
        }
        /* The toolkit department is gone, so "what's your stack" now goes
           to the work — where every entry lists the stack it was built
           with. Dropping the command outright would have left the one
           question a visitor is most likely to ask this thing answered
           with a shrug. */
        else if (cmd.includes("tool") || cmd.includes("stack") || cmd.includes("skill") || cmd.includes("technology")) {
            speak(VOICE_LINES.stack);
            navigateTo("#work");
        }
        else if (cmd.includes("contact") || cmd.includes("email") || cmd.includes("touch") || cmd.includes("message")) {
            speak(VOICE_LINES.contact);
            navigateTo("#contact");
        }

        // --- Q&A COMMANDS ---
        else if (cmd.includes("who are you") || cmd.includes("your name")) {
            speak(VOICE_LINES.whoAreYou);
        }
        else if (cmd.includes("what do you do") || cmd.includes("function")) {
            speak(VOICE_LINES.whatDoYouDo);
        }
        else if (cmd.includes("available") || cmd.includes("hire")) {
            speak(VOICE_LINES.availability);
        }
        /* `hi` and `hey` are checked as whole words. As substrings they
           matched inside "this", "which", "they" and most of the rest of
           English, so a greeting could win over a real command that
           happened to contain one. */
        else if (/\b(hello|hi|hey)\b/.test(cmd)) {
            speak(VOICE_LINES.hello);
        }

        // --- THEME COMMANDS ---
        else if (cmd.includes("light mode") || cmd.includes("switch to light") || cmd.includes("day mode")) {
            speak(VOICE_LINES.toLight);
            setTheme("light");
        }
        else if (cmd.includes("dark mode") || cmd.includes("switch to dark") || cmd.includes("night mode")) {
            speak(VOICE_LINES.toDark);
            setTheme("dark");
        }
        else if (cmd.includes("toggle theme") || cmd.includes("change theme")) {
            const next = theme === 'dark' ? 'light' : 'dark';
            speak(next === 'light' ? VOICE_LINES.toLight : VOICE_LINES.toDark);
            setTheme(next);
        }
        /* NOTHING MATCHED, AND IT NOW SAYS SO. Every unrecognised
           utterance used to fall off the end of this chain in silence,
           which is indistinguishable from the microphone being broken —
           the reader has no way to tell "I did not understand you" from
           "I did not hear you". Naming two commands that do work turns a
           dead end into an instruction. */
        else {
            speak(VOICE_LINES.notUnderstood);
        }
    }, [speak, speakAndClose, setTheme, theme]);

    /* Keep the long-lived recognition callbacks pointed at the current
       closures. These run after every render that changes either
       function, which is what makes `handleCommandRef.current(...)`
       inside `onresult` equivalent to calling the fresh `handleCommand`
       — without rebuilding the recognition object and dropping the
       microphone to do it. */
    useEffect(() => {
        handleCommandRef.current = handleCommand;
    }, [handleCommand]);

    useEffect(() => {
        speakRef.current = speak;
    }, [speak]);

    const navigateTo = (hash: string) => {
        const id = hash.replace("#", "");
        // `onNavigate` is scrollToSection() from lib/sections — it handles the
        // scroll, the reduced-motion check and the hash. Calling scrollIntoView
        // here as well would just fire a second scroll at the same target.
        if (onNavigate) onNavigate(id);
        else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    // OPTIMIZED: Immediate toggle with no artificial delays
    const toggleListening = useCallback(async () => {
        // PRIME AUDIO ON CLICK (CRITICAL FOR IOS)
        if (typeof window !== "undefined" && window.speechSynthesis) {
            const empty = new SpeechSynthesisUtterance(" ");
            window.speechSynthesis.speak(empty);
            window.speechSynthesis.cancel();
        }

        /* iOS: prime one Audio element inside the user gesture. Safari
           only lets `play()` run on an element that was created and
           played during a gesture, so every later reply reuses this
           exact element rather than constructing a new one.

           THE REF IS ASSIGNED SYNCHRONOUSLY, BEFORE `play()` RESOLVES.
           It used to be set inside `.then()`, which is a promise tick
           after the gesture — and `toggleListening` does not await it,
           so a fast tap could reach `speak()` and construct a *second*,
           unprimed element while this one was still settling. That is
           the "first reply is silent on iPhone" bug: the element that
           played was not the element that was blessed. What matters for
           the ref is that the object exists and was created here; the
           play/pause is what unlocks it, and it can finish whenever. */
        if (isIOS() && !iosAudioPrimedRef.current) {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.setAttribute('playsinline', 'true');
            audio.setAttribute('webkit-playsinline', 'true');
            // Silent WAV data URL (minimal size)
            audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
            audio.load();

            persistentAudioRef.current = audio;
            iosAudioPrimedRef.current = true;

            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(() => {
                /* The unlock failed — usually because the gesture was
                   synthetic. The element is kept anyway: it is still the
                   best candidate, and a later real tap re-runs this. */
                iosAudioPrimedRef.current = false;
            });
        }

        // Check for secure context
        if (typeof window !== "undefined" && !window.isSecureContext) {
            speakAndClose(VOICE_LINES.insecure);
            return;
        }

        /* NO RECOGNITION ON THIS BROWSER. Every browser on iOS and
           Firefox everywhere. `speakAndClose`, not `speak`: `speak`
           leaves `shouldListenRef` alone and schedules a restart of a
           recognition object that does not exist, so the panel sat open
           on "Listening" forever with nothing behind it. This says its
           piece and shuts.

           The message names a way forward rather than just refusing —
           the page works without any of this, and the mail link is two
           taps away. */
        if (!recognitionRef.current) {
            speakAndClose(
                isIOS()
                    ? VOICE_LINES.unsupportedIOS
                    : VOICE_LINES.unsupported,
            );
            return;
        }

        if (isListening || shouldListenRef.current) {
            // STOP immediately
            shouldListenRef.current = false;
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            safeStopRecognition(false);
            setIsListening(false);
        } else {
            // START immediately - show UI first
            shouldListenRef.current = true;
            retryCountRef.current = 0;
            // Optimistically show UI immediately
            setIsListening(true);
            setTranscript("");
            setResponse("");
            restartsRef.current = 0;

            /* ---- iOS TAKES THE SHORT PATH, AND IT HAS TO ---------------
               Two things below are fatal on WebKit, and both are fine
               everywhere else.

               `await getUserMedia(...)` ENDS THE GESTURE. Anything after
               an `await` is no longer running inside the tap as far as
               WebKit is concerned, so the `start()` that follows it is
               dropped exactly as a timer's would be — the reader grants
               permission and the microphone still never opens.
               Recognition prompts for permission on its own anyway, so
               the pre-flight is not buying anything here; it is only
               costing the gesture.

               THE GREETING COSTS A WHOLE TURN. Every reply ends a turn
               on iOS, so opening with "Hi! How can I help you today?"
               means the first tap is spent being greeted and the reader
               has to tap again before saying anything. On a platform
               where each turn is a deliberate tap, a pleasantry is not
               free. It goes straight to listening.

               `start()` is therefore the first thing that happens, with
               nothing awaited in front of it. */
            if (needsGesturePerTurn()) {
                hasGreetedRef.current = true;
                safeStartRecognition();
                return;
            }

            // If we already have permission, start immediately
            if (micPermissionGranted) {
                if (!hasGreetedRef.current) {
                    hasGreetedRef.current = true;
                    speak(VOICE_LINES.greeting);
                } else {
                    safeStartRecognition();
                }
            } else {
                // Request permission (this is the only blocking part)
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    setMicPermissionGranted(true);

                    if (!hasGreetedRef.current) {
                        hasGreetedRef.current = true;
                        speak(VOICE_LINES.greeting);
                    } else {
                        safeStartRecognition();
                    }
                } catch (error: any) {
                    shouldListenRef.current = false;
                    setMicPermissionGranted(false);

                    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                        speak(VOICE_LINES.micBlocked);
                    } else if (error.name === 'NotFoundError') {
                        speak(VOICE_LINES.micNotFound);
                    } else {
                        speak(VOICE_LINES.micFailed);
                    }
                }
            }
        }
    }, [isListening, speak, speakAndClose, safeStartRecognition, safeStopRecognition, micPermissionGranted]);

    /* ---- IT NO LONGER DISAPPEARS -------------------------------------
       `if (!isSupported) return null` used to sit here, and it was the
       worst behaviour in the component.

       `SpeechRecognition` is absent on every browser on iOS — Chrome
       and Firefox there are WebKit in a different wrapper, so none of
       them have it — and on Firefox everywhere. On all of those the
       button silently vanished, while the Contact department went on
       instructing the reader to "say 'contact Faaiz' to the mic in the
       top bar". A control that is documented on the page and missing
       from it reads as a broken site, not an unsupported browser.

       It was also a layout shift: `isSupported` starts `true` and is
       set false in an effect, so the button rendered, then went, one
       frame after hydration.

       The button stays. Tapping it explains, out loud and in the panel,
       which is a real answer — text-to-speech is supported in all the
       places recognition is not, so the assistant can still talk even
       where it cannot listen. */
    /* ---- OPENING THE NEXT TURN ON iOS --------------------------------
       This must be reachable from a real tap and must call `start()`
       with nothing awaited in front of it. `toggleListening` cannot be
       reused: it is `async` and awaits `getUserMedia` on the permission
       path, and an `await` ends the gesture as far as WebKit is
       concerned — everything after it is no longer "in" the tap, and
       `start()` is dropped exactly as it is from a timer.

       Permission is already granted by the time this is reachable, since
       the session is mid-flight, so there is nothing to await anyway. */
    const beginTurn = () => {
        setAwaitingTurn(false);
        setTranscript("");
        setResponse("");
        shouldListenRef.current = true;
        restartsRef.current = 0;
        setIsListening(true);
        safeStartRecognition();
    };

    /* One teardown for the close button, so it cannot leave the session
       half-open the way the old handler could — it called
       `toggleListening`, which only knew about `isListening`. */
    const closeSession = () => {
        shouldListenRef.current = false;
        setAwaitingTurn(false);
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        safeStopRecognition(true);
        stopAllAudio();
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setIsListening(false);
        setTranscript("");
        setResponse("");
    };

    const isActive = isListening || isSpeaking || awaitingTurn;
    const statusLabel = isSpeaking
        ? "Speaking"
        : awaitingTurn
            ? "Tap to speak"
            : "Listening";

    return (
        <div className="relative flex h-11 w-11 items-center justify-center">
            <AnimatePresence initial={false}>
                {!isActive && (
                    <m.button
                        key="voice-trigger"
                        onClick={toggleListening}
                        className="group/mic glass absolute inset-0 flex h-full w-full touch-manipulation items-center justify-center rounded-full text-ink transition-colors duration-300 select-none hover:text-ink"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.16 } }}
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        whileHover={isMobileDevice ? undefined : { scale: 1.06 }}
                        whileTap={{ scale: 0.92 }}
                        /* `isSupported` no longer decides whether this
                           renders — it decides what the label promises. A
                           screen-reader user on iOS should not be told
                           "open voice assistant" by a control that can
                           only ever explain why it will not open. */
                        aria-label={
                            isSupported
                                ? "Open voice assistant"
                                : "Voice assistant — not supported by this browser"
                        }
                    >
                        <Microphone size={18} weight="fill" aria-hidden />
                    </m.button>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
                {isActive && (
                    <m.div
                        key="voice-active"
                        role="dialog"
                        aria-label="Voice assistant"
                        initial={{ opacity: 0, y: -14, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.94, transition: { duration: 0.18 } }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className={`glass z-[60] flex select-none items-center overflow-hidden rounded-full ${isMobileDevice
                            ? "fixed top-[calc(env(safe-area-inset-top)+0.75rem)] right-3 left-3 min-h-[3.5rem] gap-3 px-4 py-2"
                            : "fixed top-4 left-1/2 h-[3.5rem] w-[92vw] max-w-[34rem] -translate-x-1/2 gap-4 py-2 pr-2 pl-5"
                            }`}
                        style={{
                            WebkitTapHighlightColor: "transparent",
                            willChange: "transform, opacity",
                            transform: "translateZ(0)",
                        }}
                    >
                        {/* Waveform. Bars stay taller and busier while speaking
                            than while listening, so the two states are
                            distinguishable at a glance.

                            IT GOES FLAT AND STILL BETWEEN TURNS. A waveform
                            that keeps moving while nothing is being recorded
                            is the animation that made this bug so hard to
                            see from the outside: the panel looked busy, so
                            the reader kept talking to a microphone that was
                            not open. Motion here now means "the mic is
                            live", and nothing else. */}
                        <div
                            aria-hidden
                            className="flex h-5 flex-shrink-0 items-center gap-[3px] text-accent"
                        >
                            {awaitingTurn ? (
                                [0, 1, 2, 3].map((i) => (
                                    <span
                                        key={i}
                                        className="h-1 w-0.75 rounded-full bg-current opacity-40"
                                    />
                                ))
                            ) : isMobileDevice ? (
                                <>
                                    <span className="animate-wave-1 h-2 w-0.75 rounded-full bg-current" />
                                    <span className="animate-wave-2 h-4 w-0.75 rounded-full bg-current" />
                                    <span className="animate-wave-1 h-3 w-0.75 rounded-full bg-current" />
                                    <span className="animate-wave-2 h-2 w-0.75 rounded-full bg-current" />
                                </>
                            ) : (
                                [0, 1, 2, 3, 4].map((i) => (
                                    <m.span
                                        key={i}
                                        className="w-0.75 rounded-full bg-current"
                                        animate={{
                                            height: isSpeaking
                                                ? [6, 20, 10, 18, 6]
                                                : [5, 14, 5],
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: isSpeaking ? 1.05 : 0.85,
                                            delay: i * 0.09,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <span className="coord flex items-center gap-1.5 text-coord text-ink-4">
                                {isSpeaking && <SpeakerHigh size={11} weight="fill" aria-hidden />}
                                {statusLabel}
                                {ttsRemaining !== null && ttsRemaining <= 3 && (
                                    <span className="text-accent-ink">
                                        · {ttsRemaining} left
                                    </span>
                                )}
                            </span>

                            <AnimatePresence mode="wait" initial={false}>
                                {response || transcript ? (
                                    <m.p
                                        key="output"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.18 }}
                                        className={`text-caption font-medium text-ink ${isMobileDevice ? "line-clamp-2 leading-snug" : "truncate"
                                            }`}
                                        aria-live="polite"
                                        role="status"
                                    >
                                        {response || transcript}
                                    </m.p>
                                ) : (
                                    <m.p
                                        key={hintIndex}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.18 }}
                                        className={`text-caption text-ink-3 ${isMobileDevice ? "line-clamp-2 leading-snug" : "truncate"
                                            }`}
                                    >
                                        {awaitingTurn
                                            ? "Tap the mic for the next command"
                                            : `Try “${HINTS[hintIndex]}”`}
                                    </m.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* THE TAP THAT OPENS THE NEXT TURN. Only rendered
                            where a gesture is required per turn, because
                            everywhere else the session restarts itself and a
                            button demanding a tap between commands would be
                            asking for something the platform does not need.

                            It is deliberately the same 44px target and the
                            same ink block as the send button on the contact
                            form: on iOS this is now the primary control of
                            the whole feature, not an afterthought beside the
                            close button. */}
                        {awaitingTurn && (
                            <button
                                onClick={beginTurn}
                                className="flex size-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-300 active:scale-[0.94] motion-reduce:active:scale-100"
                                style={{ WebkitTapHighlightColor: "transparent" }}
                                aria-label="Speak the next command"
                            >
                                <Microphone size={18} weight="fill" aria-hidden />
                            </button>
                        )}

                        <button
                            onClick={closeSession}
                            className="flex size-10 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-ink-3 transition-colors duration-300 hover:bg-surface-2 hover:text-ink"
                            style={{ WebkitTapHighlightColor: "transparent" }}
                            aria-label="Close voice assistant"
                        >
                            <X size={17} weight="bold" aria-hidden />
                        </button>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Pulsing halo behind the trigger while the session is live.
                Purely decorative, so it sits outside the button. */}
            {isActive && !isMobileDevice && (
                <span
                    aria-hidden
                    className="animate-halo pointer-events-none absolute inset-0 -z-10 rounded-full bg-accent/30"
                />
            )}
        </div>
    );
}
