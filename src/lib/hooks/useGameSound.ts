'use client';

import { useCallback, useRef } from 'react';
import { useUserStore } from '../stores/useUserStore';

// Audio context singleton for better performance
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
}

type SoundType = 'CORRECT' | 'WRONG' | 'CLICK' | 'WIN' | 'GAME_OVER' | 'TICK';

// Sound generator functions using Web Audio API
function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  attack: number = 0.01,
  decay: number = 0.1
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // ADSR envelope
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + attack + decay);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playCorrectSound(ctx: AudioContext) {
  // Cheerful ascending two-note chime
  playTone(ctx, 523.25, 0.15, 'sine', 0.3, 0.01, 0.05); // C5
  setTimeout(() => {
    playTone(ctx, 659.25, 0.2, 'sine', 0.35, 0.01, 0.08); // E5
  }, 80);
}

function playWrongSound(ctx: AudioContext) {
  // Low buzzy tone
  playTone(ctx, 180, 0.25, 'sawtooth', 0.2, 0.01, 0.1);
  playTone(ctx, 160, 0.25, 'sawtooth', 0.15, 0.01, 0.1);
}

function playClickSound(ctx: AudioContext) {
  // Short percussive click
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
}

function playWinSound(ctx: AudioContext) {
  // Victory fanfare - ascending arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(ctx, freq, 0.3, 'sine', 0.25, 0.01, 0.1);
    }, i * 120);
  });
}

function playGameOverSound(ctx: AudioContext) {
  // Descending tone indicating end
  playTone(ctx, 440, 0.2, 'sine', 0.3, 0.01, 0.1); // A4
  setTimeout(() => {
    playTone(ctx, 349.23, 0.2, 'sine', 0.25, 0.01, 0.1); // F4
  }, 150);
  setTimeout(() => {
    playTone(ctx, 293.66, 0.4, 'sine', 0.2, 0.01, 0.15); // D4
  }, 300);
}

function playTickSound(ctx: AudioContext) {
  // Urgent tick for low time warning
  playTone(ctx, 880, 0.08, 'square', 0.2, 0.005, 0.02);
}

export function useGameSound() {
  const { soundEnabled, hapticsEnabled } = useUserStore();
  const lastPlayTime = useRef<Record<string, number>>({});

  const play = useCallback((sound: SoundType) => {
    if (!soundEnabled) return;
    
    const ctx = getAudioContext();
    if (!ctx) return;

    // Debounce rapid successive plays of the same sound
    const now = Date.now();
    const lastTime = lastPlayTime.current[sound] || 0;
    if (now - lastTime < 50) return;
    lastPlayTime.current[sound] = now;

    switch (sound) {
      case 'CORRECT':
        playCorrectSound(ctx);
        break;
      case 'WRONG':
        playWrongSound(ctx);
        break;
      case 'CLICK':
        playClickSound(ctx);
        break;
      case 'WIN':
        playWinSound(ctx);
        break;
      case 'GAME_OVER':
        playGameOverSound(ctx);
        break;
      case 'TICK':
        playTickSound(ctx);
        break;
    }
  }, [soundEnabled]);

  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [hapticsEnabled]);

  return { play, vibrate };
}
