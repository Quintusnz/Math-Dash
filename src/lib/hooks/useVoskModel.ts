/**
 * useVoskModel - Hook to manage Vosk model loading
 * 
 * This hook handles pre-loading the Vosk model so it's ready
 * before the game starts. The model is cached globally.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createModel } from "vosk-browser";
import type { Model } from "vosk-browser";

// Model URL - using local proxy to avoid CORS issues
// The proxy fetches from alphacephei.com server-side
const MODEL_URL = "/api/vosk-model";

// Global model cache - persists across component mounts
let globalModel: Model | null = null;
let globalModelPromise: Promise<Model> | null = null;

export type VoskModelStatus = "idle" | "loading" | "ready" | "error";

export interface UseVoskModelReturn {
  status: VoskModelStatus;
  model: Model | null;
  error: string | null;
  progress: number;
  startLoading: () => void;
}

/**
 * Hook to manage Vosk model loading
 * Call startLoading() when user selects voice input
 */
export function useVoskModel(): UseVoskModelReturn {
  const [status, setStatus] = useState<VoskModelStatus>(
    globalModel?.ready ? "ready" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);

  // Check if model is already loaded on mount
  useEffect(() => {
    mountedRef.current = true;
    
    if (globalModel?.ready) {
      setStatus("ready");
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startLoading = useCallback(async () => {
    // Already loaded
    if (globalModel?.ready) {
      setStatus("ready");
      return;
    }

    // Already loading - wait for it
    if (globalModelPromise) {
      setStatus("loading");
      try {
        await globalModelPromise;
        if (mountedRef.current) {
          setStatus("ready");
          setProgress(100);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError("Failed to load voice model");
          setStatus("error");
        }
      }
      return;
    }

    // Start loading
    setStatus("loading");
    setError(null);
    setProgress(0);

    console.log("[Vosk] Starting model download...");

    globalModelPromise = createModel(MODEL_URL);

    try {
      const model = await globalModelPromise;
      
      // Set up event handlers
      model.on("load", () => {
        console.log("[Vosk] Model loaded successfully");
        if (mountedRef.current) {
          setProgress(100);
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model.on("error", (msg: any) => {
        console.error("[Vosk] Model error:", msg);
        if (mountedRef.current) {
          setError("Voice model error: " + (msg.error || "Unknown"));
          setStatus("error");
        }
      });

      globalModel = model;

      // Small delay to ensure model is fully ready
      await new Promise(resolve => setTimeout(resolve, 500));

      if (mountedRef.current) {
        setStatus("ready");
        setProgress(100);
      }

      console.log("[Vosk] Model ready for use");

    } catch (err) {
      console.error("[Vosk] Failed to load model:", err);
      globalModelPromise = null;
      
      if (mountedRef.current) {
        setError("Failed to download voice model. Check your connection.");
        setStatus("error");
      }
    }
  }, []);

  return {
    status,
    model: globalModel,
    error,
    progress,
    startLoading,
  };
}

/**
 * Get the globally cached model (if loaded)
 */
export function getGlobalVoskModel(): Model | null {
  return globalModel;
}

/**
 * Check if model is ready
 */
export function isVoskModelReady(): boolean {
  return globalModel?.ready ?? false;
}
