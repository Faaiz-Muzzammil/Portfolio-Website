"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Microphone, SpeakerHigh, X } from "@phosphor-icons/react";
import { personalInfo } from "@/data";
import { useTheme } from "next-themes";

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
    const audioContextRef = useRef<AudioContext | null>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const persistentAudioRef = useRef<HTMLAudioElement | null>(null);  // iOS: single primed element
    const iosAudioPrimedRef = useRef(false);  // iOS: track if audio is primed
    const useElevenLabsRef = useRef(true); // Try ElevenLabs first
    const MAX_RETRIES = 3;

    // Broadcast state changes
    useEffect(() => {
        onStateChange?.(isListening || isSpeaking);
    }, [isListening, isSpeaking, onStateChange]);

    // Detect mobile on mount and pre-check mic permission
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

        // Initialize AudioContext for ElevenLabs playback
        if (typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
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

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
        };
    }, []);

    // Load voices (fallback)
    const loadVoices = useCallback(() => {
        if (!synthRef.current) return;
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
            voicesLoadedRef.current = true;
        }
    }, []);

    // Safe recognition start
    const safeStartRecognition = useCallback(() => {
        if (!recognitionRef.current) return false;
        if (recognitionActiveRef.current) return true;
        if (isSpeakingRef.current) return false;

        try {
            recognitionRef.current.start();
            recognitionActiveRef.current = true;
            retryCountRef.current = 0;
            return true;
        } catch (e: any) {
            if (e.message?.includes('already started')) {
                recognitionActiveRef.current = true;
                return true;
            }
            console.error("Failed to start recognition:", e);
            return false;
        }
    }, []);

    // Safe recognition stop
    const safeStopRecognition = useCallback((abort = false) => {
        if (!recognitionRef.current) return;

        try {
            if (abort) {
                recognitionRef.current.abort();
            } else {
                recognitionRef.current.stop();
            }
        } catch (e) { /* ignore */ }

        recognitionActiveRef.current = false;
    }, []);

    // Escape closes the session. The command bar covers the nav while open,
    // so there has to be a keyboard way out of it.
    useEffect(() => {
        if (!isListening && !isSpeaking) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            shouldListenRef.current = false;
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            safeStopRecognition(false);
            setIsListening(false);
            window.speechSynthesis?.cancel();
            setIsSpeaking(false);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isListening, isSpeaking, safeStopRecognition]);

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

                recognition.onstart = () => {
                    recognitionActiveRef.current = true;
                    setIsListening(true);
                };

                recognition.onerror = (event: any) => {
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
                        speak("Please allow microphone access.");
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

                recognition.onend = () => {
                    recognitionActiveRef.current = false;

                    if (shouldListenRef.current && !isSpeakingRef.current) {
                        const delay = isMobile() ? 300 : 100;

                        restartTimeoutRef.current = setTimeout(() => {
                            if (shouldListenRef.current && !isSpeakingRef.current && !recognitionActiveRef.current) {
                                safeStartRecognition();
                            }
                        }, delay);
                    } else {
                        setIsListening(false);
                    }
                };

                recognition.onresult = (event: any) => {
                    let finalTranscript = "";

                    if (isMobile()) {
                        finalTranscript = event.results[0][0].transcript;
                        setTranscript(finalTranscript);
                        handleCommand(finalTranscript.toLowerCase());
                    } else {
                        const lastResult = event.results[event.results.length - 1];
                        finalTranscript = lastResult[0].transcript;
                        setTranscript(finalTranscript);

                        if (lastResult.isFinal) {
                            handleCommand(finalTranscript.toLowerCase());
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

                    const cleanup = () => {
                        URL.revokeObjectURL(audioUrl);
                    };

                    const finish = (success: boolean) => {
                        if (resolved) return;
                        resolved = true;
                        cleanup();
                        resolve(success);
                    };

                    audio.onended = () => finish(true);
                    audio.onerror = () => finish(false);

                    // Wait for audio to be ready before playing
                    audio.oncanplaythrough = () => {
                        if (resolved) return;
                        // CRITICAL: Cancel native speech RIGHT before play()
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        audio.play().catch((e) => {
                            console.error('Audio play failed:', e);
                            finish(false);
                        });
                    };

                    // Fallback for browsers that don't fire canplaythrough
                    audio.onloadeddata = () => {
                        if (resolved) return;
                        // CRITICAL: Cancel native speech RIGHT before play()
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        audio.play().catch((e) => {
                            console.error('Audio play on loadeddata failed:', e);
                            finish(false);
                        });
                    };

                    // Start loading
                    audio.load();
                });

            } catch (error) {
                console.error('ElevenLabs TTS error:', error);
                return false;
            }
        })();

        // Race between TTS and timeout
        return Promise.race([ttsPromise, timeoutPromise]);
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

        // Try ElevenLabs first (if enabled and not rate-limited)
        if (useElevenLabsRef.current) {
            const success = await speakWithElevenLabs(text);
            if (success) {
                onSpeechEnd();
                return;
            }
            // On iOS, if 11labs fails, don't fall back to native (jarring voice switch)
            if (isIOS()) {
                console.warn('11labs failed on iOS - skipping native fallback');
                onSpeechEnd();
                return;
            }
        }

        // Fallback to browser TTS (not on iOS)
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
            // On iOS, if 11labs fails, don't fall back to native
            if (isIOS()) {
                console.warn('11labs failed on iOS (speakAndClose) - skipping native fallback');
                onEnd();
                return;
            }
        }

        // Fallback to browser (not on iOS)
        setTimeout(() => {
            speakWithBrowser(text, onEnd);
        }, 50);

    }, [speakWithElevenLabs, speakWithBrowser, safeStopRecognition]);

    const handleCommand = useCallback((cmd: string) => {

        // --- STOP/CANCEL COMMANDS ---
        if (cmd.includes("cancel") || cmd.includes("stop") || cmd.includes("close") || cmd.includes("bye")) {
            speakAndClose("Goodbye!");
            return;
        }

        // --- NAVIGATION COMMANDS ---
        else if (cmd.includes("home") || cmd.includes("start")) {
            speak("Going to home.");
            navigateTo("#home");
        }
        else if (cmd.includes("project") || cmd.includes("work") || cmd.includes("portfolio")) {
            speak("Navigating to projects.");
            navigateTo("#work");
        }
        else if (cmd.includes("experience") || cmd.includes("job") || cmd.includes("career")) {
            speak("Showing experience section.");
            navigateTo("#experience");
        }
        /* The toolkit department is gone, so "what's your stack" now goes
           to the work — where every entry lists the stack it was built
           with. Dropping the command outright would have left the one
           question a visitor is most likely to ask this thing answered
           with a shrug. */
        else if (cmd.includes("tool") || cmd.includes("stack") || cmd.includes("skill") || cmd.includes("technology")) {
            speak("Each project lists what it was built with — here they are.");
            navigateTo("#work");
        }
        else if (cmd.includes("contact") || cmd.includes("email") || cmd.includes("touch") || cmd.includes("message")) {
            speak("Taking you to the contact form.");
            navigateTo("#contact");
        }

        // --- Q&A COMMANDS ---
        else if (cmd.includes("who are you") || cmd.includes("your name")) {
            speak(`I am an AI assistant for ${personalInfo.name}. He is a ${personalInfo.role}.`);
        }
        else if (cmd.includes("what do you do") || cmd.includes("function")) {
            speak("I help you navigate this portfolio and answer questions about Faaiz's work.");
        }
        else if (cmd.includes("available") || cmd.includes("hire")) {
            speak(personalInfo.available ? "Yes, Faaiz is currently available for new projects." : "Faaiz is currently busy, but you can always reach out.");
        }
        else if (cmd.includes("hello") || cmd.includes("hi") || cmd.includes("hey")) {
            speak("Hello there! How can I help you navigate today?");
        }

        // --- THEME COMMANDS ---
        else if (cmd.includes("light mode") || cmd.includes("switch to light") || cmd.includes("day mode")) {
            speak("Switching to light mode.");
            setTheme("light");
        }
        else if (cmd.includes("dark mode") || cmd.includes("switch to dark") || cmd.includes("night mode")) {
            speak("Switching to dark mode.");
            setTheme("dark");
        }
        else if (cmd.includes("toggle theme") || cmd.includes("change theme")) {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            speak(`Switching to ${newTheme} mode.`);
            setTheme(newTheme);
        }
    }, [speak, speakAndClose, setTheme, theme]);

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

        // iOS: Prime a persistent Audio element on user gesture
        // This is CRITICAL - iOS only allows audio.play() if the Audio was created/primed during user gesture
        if (isIOS() && !iosAudioPrimedRef.current) {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.setAttribute('playsinline', 'true');
            audio.setAttribute('webkit-playsinline', 'true');
            // Silent WAV data URL (minimal size)
            audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
            audio.load();
            // Prime by playing (will be silent)
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                persistentAudioRef.current = audio;
                iosAudioPrimedRef.current = true;
                console.log('iOS audio primed successfully');
            }).catch((e) => {
                console.warn('iOS audio prime failed:', e);
                // Still store ref even if prime fails
                persistentAudioRef.current = audio;
                iosAudioPrimedRef.current = true;
            });
        }

        // Also resume AudioContext if suspended
        if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        // Check for secure context
        if (typeof window !== "undefined" && !window.isSecureContext) {
            speak("Voice commands require a secure HTTPS connection.");
            return;
        }

        // iOS doesn't support speech recognition
        if (isIOS() && !recognitionRef.current) {
            speak("Speech recognition is not supported on iOS Safari.");
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

            // If we already have permission, start immediately
            if (micPermissionGranted) {
                if (!hasGreetedRef.current) {
                    hasGreetedRef.current = true;
                    speak("Hi! How can I help you today?");
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
                        speak("Hi! How can I help you today?");
                    } else {
                        safeStartRecognition();
                    }
                } catch (error: any) {
                    shouldListenRef.current = false;
                    setMicPermissionGranted(false);

                    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                        speak("Microphone access was blocked.");
                    } else if (error.name === 'NotFoundError') {
                        speak("No microphone found.");
                    } else {
                        speak("Could not access microphone.");
                    }
                }
            }
        }
    }, [isListening, speak, safeStartRecognition, safeStopRecognition, micPermissionGranted]);

    if (!isSupported) return null;

    const isActive = isListening || isSpeaking;
    const statusLabel = isSpeaking ? "Speaking" : "Listening";

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
                        aria-label="Open voice assistant"
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
                            distinguishable at a glance. */}
                        <div
                            aria-hidden
                            className="flex h-5 flex-shrink-0 items-center gap-[3px] text-accent"
                        >
                            {isMobileDevice ? (
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
                                        Try &ldquo;{HINTS[hintIndex]}&rdquo;
                                    </m.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={toggleListening}
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
