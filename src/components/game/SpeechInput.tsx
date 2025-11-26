import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { getClosestNumber, generateNumberGrammar } from "@/lib/game-engine/speech-utils";
import styles from "./SpeechInput.module.css";

interface SpeechInputProps {
  onAnswer: (answer: number) => void;
  disabled?: boolean;
}

type ListeningState = "idle" | "listening" | "processing" | "error" | "unsupported";
type Feedback = "none" | "correct" | "incorrect";

/**
 * Hands-free voice input:
 * - Auto-starts when enabled; restarts on end.
 * - Displays what it heard (final best guess).
 * - Flashes green for correct, red for incorrect; advances on correct via onAnswer.
 * - Lightweight: Web Speech API + our number parser; no push-to-talk.
 */
export function SpeechInput({ onAnswer, disabled }: SpeechInputProps) {
  const [listeningState, setListeningState] = useState<ListeningState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [feedback, setFeedback] = useState<Feedback>("none");

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef<boolean>(false);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fatalRef = useRef<boolean>(false);
  const backoffRef = useRef<number>(600); // ms backoff for transient errors

  const cleanupRecognition = useCallback(() => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechGrammarList =
      (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;

    if (!SpeechRecognition) {
      setSupported(false);
      setListeningState("unsupported");
      setError("Speech recognition not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    if (SpeechGrammarList) {
      try {
        const list = new SpeechGrammarList();
        list.addFromString(generateNumberGrammar(), 1);
        recognition.grammars = list;
      } catch {
        // ignore grammar failure
      }
    }

    return recognition;
  }, []);

  const startListening = useCallback(() => {
    if (disabled || !supported) return;

    // ensure fresh instance
    cleanupRecognition();
    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    shouldListenRef.current = true;
    setError(null);
    setFeedback("none");
    fatalRef.current = false;

    recognition.onstart = () => {
      setListeningState("listening");
    };

    recognition.onresult = (event: any) => {
      const finals: string[] = [];
      const alts: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        for (let j = 0; j < res.length; j++) {
          alts.push(res[j].transcript.trim().toLowerCase());
        }
        if (res.isFinal) {
          finals.push(res[0].transcript.trim().toLowerCase());
        }
      }
      const candidates = (finals.length ? finals : alts).slice(-3);
      const bestHeard = candidates[candidates.length - 1] || "";
      if (bestHeard) setTranscript(bestHeard);

      let bestMatch: { num: number; conf: number } | null = null;
      for (const c of candidates) {
        const parsed = getClosestNumber(c);
        if (parsed && (!bestMatch || parsed.confidence > bestMatch.conf)) {
          bestMatch = { num: parsed.number, conf: parsed.confidence };
        }
      }

      if (bestMatch) {
        if (bestMatch.conf >= 0.65) {
          setFeedback("correct");
          setListeningState("processing");
          onAnswer(bestMatch.num);
          // show briefly then clear
          setTimeout(() => {
            setFeedback("none");
            setTranscript("");
          }, 900);
        } else {
          setFeedback("incorrect");
          setTimeout(() => setFeedback("none"), 800);
        }
      }
    };

    recognition.onerror = (event: any) => {
      let message = "Voice input error. Trying again...";

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        message = "Microphone access denied. Allow mic in the browser and retry.";
        fatalRef.current = true;
        shouldListenRef.current = false;
      } else if (event.error === "no-speech" || event.error === "aborted") {
        // transient, will restart with small backoff
        shouldListenRef.current = true;
      } else if (event.error === "network") {
        // Chrome returns network for speech service hiccups; back off a bit more
        message = "Network issue with speech. Retrying...";
        shouldListenRef.current = true;
        backoffRef.current = Math.min(backoffRef.current * 1.5, 5000);
      } else {
        shouldListenRef.current = true;
      }

      setError(message);
      setListeningState(fatalRef.current ? "error" : "idle");
    };

    recognition.onend = () => {
      // restart if we should keep listening and not disabled
      if (shouldListenRef.current && !disabled && supported && !fatalRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          startListening();
        }, backoffRef.current);
      } else {
        setListeningState((prev) => (prev === "processing" ? "idle" : prev));
      }
    };

    try {
      recognition.start();
    } catch {
      setError("Could not start mic. Check permissions and try again.");
      fatalRef.current = true;
      setListeningState("error");
    }
  }, [cleanupRecognition, disabled, initRecognition, onAnswer, supported]);

  // Auto start when enabled; stop when disabled/unmounted
  useEffect(() => {
    if (!disabled) {
      shouldListenRef.current = true;
      startListening();
    } else {
      shouldListenRef.current = false;
      cleanupRecognition();
      setListeningState("idle");
      setTranscript("");
    }
    return () => {
      shouldListenRef.current = false;
      cleanupRecognition();
    };
  }, [disabled, startListening, cleanupRecognition]);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.listenIndicator} ${
          listeningState === "listening" ? styles.active : ""
        } ${feedback === "correct" ? styles.correct : ""} ${
          feedback === "incorrect" ? styles.incorrect : ""
        }`}
        aria-label={
          listeningState === "listening"
            ? "Listening"
            : listeningState === "processing"
            ? "Processing"
            : "Idle"
        }
      >
        {listeningState === "processing" ? (
          <Loader2 size={32} className={styles.spin} />
        ) : (
          <div className={styles.pulse} />
        )}
      </div>

      <div className={styles.status}>
        {supported ? (
          error ? (
            <span style={{ color: "var(--color-error)" }}>{error}</span>
          ) : listeningState === "listening" ? (
            "Listening... say the answer"
          ) : listeningState === "processing" ? (
            "Processing..."
          ) : (
            "Voice ready"
          )
        ) : (
          "Speech not supported in this browser"
        )}
      </div>

      <div className={styles.transcript}>
        {transcript && <span className={styles.heardLabel}>Heard:</span>}
        {transcript}
      </div>
    </div>
  );
}
