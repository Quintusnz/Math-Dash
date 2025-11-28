"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import {
  parseWithExpectedAnswer,
  getClosestNumber,
  shouldAcceptResult,
  numberToWords,
  type ParseResult,
} from "@/lib/game-engine/speech-utils";
import styles from "./SpeechInput.module.css";

// ============================================================================
// TYPES
// ============================================================================

interface SpeechInputProps {
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  expectedAnswer?: number;
  showHint?: boolean;
}

type Status = "idle" | "starting" | "listening" | "processing" | "error" | "unsupported";

// ============================================================================
// HELPERS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRecognitionConstructor(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SpeechInput({
  onAnswer,
  disabled = false,
  expectedAnswer,
  showHint = true,
}: SpeechInputProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsedNumber, setParsedNumber] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const networkErrorsRef = useRef(0);

  // Clear any pending restart
  const clearRestart = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  // Stop recognition
  const stopRecognition = useCallback(() => {
    clearRestart();
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
  }, [clearRestart]);

  // Start recognition
  const startRecognition = useCallback(() => {
    const RecognitionCtor = getRecognitionConstructor();
    
    if (!RecognitionCtor) {
      setStatus("unsupported");
      setErrorMsg("Voice not supported. Try Chrome or Edge.");
      return;
    }

    // Clean up first
    stopRecognition();
    
    isActiveRef.current = true;
    setStatus("starting");
    setErrorMsg(null);

    const recognition = new RecognitionCtor();
    recognitionRef.current = recognition;

    // Configure
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    // Event: Started successfully
    recognition.onstart = () => {
      console.log("[Voice] Started listening");
      setStatus("listening");
      networkErrorsRef.current = 0;
    };

    // Event: Audio started (mic is working)
    recognition.onaudiostart = () => {
      console.log("[Voice] Audio capture started");
    };

    // Event: Sound detected
    recognition.onsoundstart = () => {
      console.log("[Voice] Sound detected");
    };

    // Event: Speech detected  
    recognition.onspeechstart = () => {
      console.log("[Voice] Speech detected");
    };

    // Event: Got results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      console.log("[Voice] Got result event:", event);
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      // Get transcript
      const text = lastResult[0].transcript.trim();
      console.log("[Voice] Heard:", text, "Final:", lastResult.isFinal);
      setTranscript(text);

      // Only process final results
      if (!lastResult.isFinal) return;

      // Collect all alternatives
      const alternatives: string[] = [];
      for (let i = 0; i < lastResult.length; i++) {
        alternatives.push(lastResult[i].transcript.trim().toLowerCase());
      }

      // Parse with expected answer biasing
      let result: ParseResult;
      if (expectedAnswer !== undefined) {
        result = parseWithExpectedAnswer(text, expectedAnswer, alternatives);
      } else {
        const parsed = getClosestNumber(text);
        result = {
          number: parsed?.number ?? NaN,
          confidence: parsed?.confidence ?? 0,
          matchedExpected: false,
          rawText: text,
        };
      }

      console.log("[Voice] Parsed:", result);

      if (!isNaN(result.number)) {
        setParsedNumber(result.number);
      }

      // Check if we should accept
      if (shouldAcceptResult(result, expectedAnswer !== undefined)) {
        setStatus("processing");
        console.log("[Voice] Accepted:", result.number);
        
        // Small delay for UX, then submit
        setTimeout(() => {
          onAnswer(result.number);
          setTranscript("");
          setParsedNumber(null);
        }, 200);
      }
    };

    // Event: Error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.log("[Voice] Error:", event.error);
      
      switch (event.error) {
        case "not-allowed":
          setErrorMsg("Please allow microphone access.");
          setStatus("error");
          isActiveRef.current = false;
          return;
          
        case "audio-capture":
          setErrorMsg("No microphone found.");
          setStatus("error");
          isActiveRef.current = false;
          return;
          
        case "network":
          networkErrorsRef.current++;
          if (networkErrorsRef.current >= 3) {
            setErrorMsg("Voice needs internet connection.");
            setStatus("error");
            isActiveRef.current = false;
            return;
          }
          // Will retry via onend
          break;
          
        case "no-speech":
        case "aborted":
          // Normal, will restart via onend
          break;
          
        default:
          console.log("[Voice] Unknown error:", event.error);
      }
    };

    // Event: Ended - restart if still active
    recognition.onend = () => {
      console.log("[Voice] Ended, active:", isActiveRef.current);
      recognitionRef.current = null;
      
      if (isActiveRef.current && !disabled) {
        // Restart after a short delay
        restartTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            startRecognition();
          }
        }, 300);
      } else {
        setStatus("idle");
      }
    };

    // Actually start
    try {
      recognition.start();
      console.log("[Voice] Called start()");
    } catch (err) {
      console.error("[Voice] Start failed:", err);
      setErrorMsg("Could not start voice. Try refreshing.");
      setStatus("error");
      isActiveRef.current = false;
    }
  }, [disabled, expectedAnswer, onAnswer, stopRecognition]);

  // Start/stop based on disabled prop
  useEffect(() => {
    if (disabled) {
      stopRecognition();
      setStatus("idle");
      setTranscript("");
      setParsedNumber(null);
    } else {
      startRecognition();
    }

    return () => {
      stopRecognition();
    };
  }, [disabled, startRecognition, stopRecognition]);

  // Reset display when question changes
  useEffect(() => {
    setTranscript("");
    setParsedNumber(null);
    setErrorMsg(null);
  }, [expectedAnswer]);

  // Get hint text
  const hint = showHint && expectedAnswer !== undefined 
    ? numberToWords(expectedAnswer)[0] 
    : null;

  // Render
  return (
    <div className={styles.container}>
      {/* Mic icon */}
      <div
        className={`${styles.micIndicator} ${status === "listening" ? styles.active : ""}`}
        role="status"
        aria-label={status === "listening" ? "Listening" : "Voice input"}
      >
        {status === "processing" ? (
          <Loader2 size={36} className={styles.spin} />
        ) : status === "error" || status === "unsupported" ? (
          <MicOff size={36} />
        ) : (
          <Mic size={36} />
        )}
        {status === "listening" && <div className={styles.pulseRing} />}
      </div>

      {/* Status message */}
      <div className={`${styles.status} ${errorMsg ? styles.error : ""}`}>
        {errorMsg ? errorMsg : 
         status === "starting" ? "Starting microphone..." :
         status === "listening" ? "🎤 Listening... say the answer!" :
         status === "processing" ? "Got it!" :
         status === "unsupported" ? "Voice not supported" :
         "Voice ready"}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className={styles.transcript}>
          <span className={styles.heardLabel}>Heard:</span>
          <span className={styles.heardText}>&ldquo;{transcript}&rdquo;</span>
          {parsedNumber !== null && (
            <span className={styles.parsedNumber}>→ {parsedNumber}</span>
          )}
        </div>
      )}

      {/* Hint */}
      {hint && status === "listening" && !transcript && (
        <div className={styles.hint}>
          <Volume2 size={16} />
          <span>Say: &ldquo;{hint}&rdquo;</span>
        </div>
      )}
    </div>
  );
}
