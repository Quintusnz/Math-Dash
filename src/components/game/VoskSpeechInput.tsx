"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import type { Model } from "vosk-browser";
import { getGlobalVoskModel, isVoskModelReady } from "@/lib/hooks/useVoskModel";
import {
  parseWithExpectedAnswer,
  getClosestNumber,
  shouldAcceptResult,
  buildNumberGrammar,
  type ParseResult,
} from "@/lib/game-engine/speech-utils";
import styles from "./SpeechInput.module.css";

// ============================================================================
// TYPES
// ============================================================================

interface VoskSpeechInputProps {
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  expectedAnswer?: number;
  showHint?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
}

type Status = 
  | "waiting-model"   // Waiting for model to be pre-loaded
  | "ready"           // Model loaded, ready to listen  
  | "listening"       // Actively listening
  | "processing"      // Processing final result
  | "error";          // Error state

// ============================================================================
// COMPONENT
// ============================================================================

export function VoskSpeechInput({
  onAnswer,
  disabled = false,
  expectedAnswer,
  showHint = true,
  feedback = null,
}: VoskSpeechInputProps) {
  const [status, setStatus] = useState<Status>("waiting-model");
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [parsedNumber, setParsedNumber] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState<{ text: string; number: number | null } | null>(null);

  // Refs for audio pipeline
  const modelRef = useRef<Model | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef(false);
  
  // Refs for latest values (to avoid stale closures)
  const expectedAnswerRef = useRef(expectedAnswer);
  const onAnswerRef = useRef(onAnswer);
  
  // Keep refs updated
  useEffect(() => {
    expectedAnswerRef.current = expectedAnswer;
  }, [expectedAnswer]);
  
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  // Get the pre-loaded model on mount
  useEffect(() => {
    // Check if model is already ready
    if (isVoskModelReady()) {
      modelRef.current = getGlobalVoskModel();
      setStatus("ready");
      console.log("[Vosk] Using pre-loaded model");
    } else {
      // Poll for model to be ready (should already be loading from GameSetup)
      const checkModel = setInterval(() => {
        if (isVoskModelReady()) {
          modelRef.current = getGlobalVoskModel();
          setStatus("ready");
          console.log("[Vosk] Model became ready");
          clearInterval(checkModel);
        }
      }, 500);

      // Timeout after 30 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkModel);
        if (!isVoskModelReady()) {
          setErrorMsg("Voice model not loaded. Please go back and try again.");
          setStatus("error");
        }
      }, 30000);

      return () => {
        clearInterval(checkModel);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Process recognized text (uses refs to always have latest values)
  const processResult = useCallback((text: string) => {
    const currentExpectedAnswer = expectedAnswerRef.current;
    const currentOnAnswer = onAnswerRef.current;
    
    // Parse with expected answer biasing
    let result: ParseResult;
    if (currentExpectedAnswer !== undefined) {
      result = parseWithExpectedAnswer(text, currentExpectedAnswer, [text.toLowerCase()]);
    } else {
      const parsed = getClosestNumber(text);
      result = {
        number: parsed?.number ?? NaN,
        confidence: parsed?.confidence ?? 0,
        matchedExpected: false,
        rawText: text,
      };
    }

    console.log("[Vosk] Parsed:", result);

    if (!isNaN(result.number)) {
      setParsedNumber(result.number);
    }

    // Check if we should accept
    if (shouldAcceptResult(result, currentExpectedAnswer !== undefined)) {
      setStatus("processing");
      console.log("[Vosk] Accepted:", result.number);
      
      // Save the heard text so it stays visible
      setLastHeard({ text: text, number: result.number });
      
      // Submit answer immediately - no artificial delay needed
      // The game handles feedback timing
      currentOnAnswer(result.number);
      setTranscript("");
      setPartialTranscript("");
      setParsedNumber(null);
      // Stay in listening status - ready for next answer immediately
      setStatus("listening");
    }
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    if (!modelRef.current || isListeningRef.current) return;

    try {
      console.log("[Vosk] Starting listening...");
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Create recognizer with grammar for numbers only
      // This significantly improves accuracy by restricting vocabulary
      const numberGrammar = buildNumberGrammar();
      console.log("[Vosk] Using number grammar:", numberGrammar.substring(0, 100) + "...");
      
      const recognizer = new modelRef.current.KaldiRecognizer(16000, numberGrammar);
      recognizer.setWords(true);
      recognizerRef.current = recognizer;

      // Handle results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognizer.on("result", (message: any) => {
        const text = message.result?.text?.trim() || "";
        console.log("[Vosk] Final result:", text);
        
        if (text) {
          setTranscript(text);
          setPartialTranscript("");
          processResult(text);
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognizer.on("partialresult", (message: any) => {
        const partial = message.result?.partial?.trim() || "";
        if (partial) {
          console.log("[Vosk] Partial:", partial);
          setPartialTranscript(partial);
          
          // EARLY ACCEPTANCE: If partial matches expected answer, accept immediately!
          // This makes voice input feel much faster
          const currentExpectedAnswer = expectedAnswerRef.current;
          if (currentExpectedAnswer !== undefined) {
            const result = parseWithExpectedAnswer(partial, currentExpectedAnswer, [partial.toLowerCase()]);
            // Only early-accept if it matches expected answer with good confidence
            if (result.matchedExpected && result.confidence >= 0.9) {
              console.log("[Vosk] Early accept from partial:", result.number);
              setTranscript(partial);
              setPartialTranscript("");
              processResult(partial);
            }
          }
        }
      });

      // Create audio processing pipeline
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Use ScriptProcessorNode (deprecated but widely supported)
      // AudioWorklet would be better but requires more setup
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        if (recognizerRef.current && isListeningRef.current) {
          try {
            recognizerRef.current.acceptWaveform(event.inputBuffer);
          } catch (error) {
            console.error("[Vosk] Process error:", error);
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      isListeningRef.current = true;
      setStatus("listening");
      console.log("[Vosk] Now listening");

    } catch (error) {
      console.error("[Vosk] Failed to start listening:", error);
      setErrorMsg("Could not access microphone. Please allow microphone access.");
      setStatus("error");
    }
  }, [processResult]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log("[Vosk] Stopping listening...");
    isListeningRef.current = false;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (recognizerRef.current) {
      recognizerRef.current.remove();
      recognizerRef.current = null;
    }

    setStatus("ready");
  }, []);

  // Start/stop based on disabled prop
  useEffect(() => {
    if (status === "waiting-model" || status === "error") return;

    if (!disabled && status === "ready") {
      startListening();
    } else if (disabled && status === "listening") {
      stopListening();
    }
    // Note: We intentionally don't include startListening/stopListening in deps
    // to avoid re-running on every render. The refs handle the actual state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, status]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (isListeningRef.current) {
        // Inline cleanup to avoid dependency issues
        isListeningRef.current = false;
        processorRef.current?.disconnect();
        sourceRef.current?.disconnect();
        audioContextRef.current?.close();
        streamRef.current?.getTracks().forEach(track => track.stop());
        recognizerRef.current?.remove();
      }
    };
  }, []);

  // Reset display when question changes
  useEffect(() => {
    setTranscript("");
    setPartialTranscript("");
    setParsedNumber(null);
    // Don't clear lastHeard immediately - let it stay visible until there's new input
  }, [expectedAnswer]);

  // Render waiting state (model should already be loaded from GameSetup)
  if (status === "waiting-model") {
    return (
      <div className={styles.container}>
        <div className={styles.progressContainer}>
          <div className={styles.micIndicator}>
            <Loader2 size={32} className={styles.spin} />
          </div>
          
          <div className={styles.loadingMessage}>
            <span className={styles.loadingTitle}>⏳ Getting ready...</span>
            <span className={styles.loadingSubtitle}>
              Voice recognition loading
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className={styles.container}>
      {/* Visual Feedback Overlay */}
      {feedback && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: feedback === 'correct' 
              ? 'rgba(34, 197, 94, 0.3)' 
              : 'rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            animation: 'feedbackPulse 0.2s ease-out',
          }}
        >
          <span style={{
            fontSize: '3rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}>
            {feedback === 'correct' ? '✓' : '✗'}
          </span>
        </div>
      )}

      {/* Mic icon */}
      <div
        className={`${styles.micIndicator} ${status === "listening" ? styles.active : ""}`}
        style={{
          backgroundColor: feedback === 'correct' 
            ? 'rgba(34, 197, 94, 0.9)' 
            : feedback === 'incorrect'
            ? 'rgba(239, 68, 68, 0.9)'
            : undefined,
          transition: 'background-color 0.15s ease',
        }}
        role="status"
        aria-label={status === "listening" ? "Listening" : "Voice input"}
      >
        {status === "processing" ? (
          <Loader2 size={36} className={styles.spin} />
        ) : status === "error" ? (
          <MicOff size={36} />
        ) : (
          <Mic size={36} />
        )}
        {status === "listening" && !feedback && <div className={styles.pulseRing} />}
      </div>

      {/* Status message */}
      <div className={`${styles.status} ${errorMsg ? styles.error : ""}`}>
        {feedback === 'correct' ? "✓ Correct!" :
         feedback === 'incorrect' ? "✗ Try again!" :
         errorMsg ? errorMsg : 
         status === "listening" ? "🎤 Listening... say the answer!" :
         status === "processing" ? "Got it!" :
         status === "ready" ? "Voice ready" :
         "Voice input"}
      </div>

      {/* Transcript - shows current or last heard text */}
      <div className={styles.transcript} style={{
        opacity: (transcript || partialTranscript || lastHeard) ? 1 : 0.3,
        transition: 'opacity 0.2s ease',
      }}>
        <span className={styles.heardLabel}>Heard:</span>
        <span className={styles.heardText} style={{
          color: (transcript || partialTranscript) ? '#fff' : 'rgba(255,255,255,0.7)',
        }}>
          {(transcript || partialTranscript) 
            ? `"${transcript || partialTranscript}"`
            : lastHeard 
              ? `"${lastHeard.text}"`
              : '"..."'
          }
        </span>
        {(parsedNumber !== null || lastHeard?.number !== null) && (
          <span className={styles.parsedNumber} style={{
            backgroundColor: feedback === 'correct' 
              ? 'rgba(34, 197, 94, 0.3)' 
              : feedback === 'incorrect'
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(99, 102, 241, 0.3)',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}>
            → {parsedNumber !== null ? parsedNumber : lastHeard?.number}
          </span>
        )}
      </div>

      {/* Debug Panel - collapsible, shows what Vosk is hearing */}
      <details style={{
        marginTop: '1rem',
        maxWidth: '300px',
      }}>
        <summary style={{
          cursor: 'pointer',
          padding: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '8px',
          fontSize: '0.7rem',
          fontFamily: 'monospace',
          color: '#888',
          border: '1px solid rgba(0, 255, 0, 0.2)',
          userSelect: 'none',
        }}>
          🐛 Debug (click to toggle)
        </summary>
        <div style={{
          marginTop: '0.25rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          color: '#00ff00',
          textAlign: 'left',
          border: '1px solid rgba(0, 255, 0, 0.3)',
        }}>
          <div>Status: <span style={{ color: status === 'listening' ? '#0f0' : '#ff0' }}>{status}</span></div>
          <div>Expected: <span style={{ color: '#0ff' }}>{expectedAnswer ?? 'none'}</span></div>
          <div>Partial: <span style={{ color: '#ff0' }}>{partialTranscript || '...'}</span></div>
          <div>Final: <span style={{ color: '#0f0' }}>{transcript || '...'}</span></div>
          <div>Parsed: <span style={{ color: '#f0f' }}>{parsedNumber !== null ? parsedNumber : '...'}</span></div>
        </div>
      </details>
    </div>
  );
}
