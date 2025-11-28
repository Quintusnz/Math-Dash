/**
 * Vosk Service - Manages offline speech recognition
 * 
 * This service handles:
 * - Loading the Vosk model (downloaded on first use)
 * - Creating recognizers
 * - Managing the audio pipeline
 */

import { createModel, Model, KaldiRecognizer } from "vosk-browser";

// Model URL - using local proxy to avoid CORS issues
// The proxy fetches from alphacephei.com server-side
const MODEL_URL = "/api/vosk-model";

// Singleton model instance
let modelInstance: Model | null = null;
let modelLoading: Promise<Model> | null = null;

export interface VoskResult {
  text: string;
  partial?: string;
}

export type VoskEventType = "result" | "partialresult" | "error";

/**
 * Get or load the Vosk model
 * The model is loaded lazily on first use and cached
 */
export async function getModel(): Promise<Model> {
  // Return cached model if available
  if (modelInstance?.ready) {
    return modelInstance;
  }

  // If already loading, wait for it
  if (modelLoading) {
    return modelLoading;
  }

  // Start loading
  console.log("[Vosk] Loading model from:", MODEL_URL);
  
  modelLoading = createModel(MODEL_URL);
  
  try {
    modelInstance = await modelLoading;
    console.log("[Vosk] Model loaded successfully");
    return modelInstance;
  } catch (error) {
    console.error("[Vosk] Failed to load model:", error);
    modelLoading = null;
    throw error;
  }
}

/**
 * Check if the model is loaded and ready
 */
export function isModelReady(): boolean {
  return modelInstance?.ready ?? false;
}

/**
 * Create a new recognizer from the loaded model
 */
export function createRecognizer(model: Model): KaldiRecognizer {
  const recognizer = new model.KaldiRecognizer(16000); // 16kHz sample rate
  recognizer.setWords(true); // Include word-level confidence
  return recognizer;
}

/**
 * Terminate the model and free resources
 */
export function terminateModel(): void {
  if (modelInstance) {
    modelInstance.terminate();
    modelInstance = null;
    modelLoading = null;
    console.log("[Vosk] Model terminated");
  }
}

/**
 * Get the current loading status
 */
export function getLoadingStatus(): "not-loaded" | "loading" | "ready" | "error" {
  if (modelInstance?.ready) return "ready";
  if (modelLoading) return "loading";
  return "not-loaded";
}
