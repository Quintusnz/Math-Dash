# Ready Steady Math – Acceptance Criteria Index

This file centralises the main acceptance criteria from the PRD and detailed requirements.

## 1. Core Dash Round Gameplay

- See `requirements2.md` Section 3.1 (`FR-1.1`–`FR-1.18`, `NFR-1.1`–`NFR-1.3`).
- Summary:
  - Start a session with selected profile/topic/mode.
  - One question at a time; immediate feedback with correct/wrong highlight.
  - Timer or question counter drives end of session.
  - Summary screen shows key stats and personal best indicator.
  - Sessions interruptible and resumable; offline‑safe.

## 2. Topic & Skill Library

- See `requirements2.md` Section 3.2 (`FR-2.x`).
- Summary:
  - Configurable topic catalogue (2×–12×, bonds, doubles/halves).
  - Free vs premium topic split; locked topics marked and upgrade‑gated.
  - Age‑appropriate default topics per profile.

## 3. Game Modes

- See `requirements2.md` Section 3.3 (`FR-3.x`).
- Summary:
  - Timed, question‑count, and practice modes with consistent behaviour.
  - At most 3 main choices visible at once.
  - Practice mode has no timer but offers summary on exit.

## 4. Player Profiles & Avatars

- See `requirements2.md` Section 3.4 (`FR-4.x`).
- Summary:
  - Up to 8 profiles per device.
  - Profile creation with validation and optional avatar.
  - Profile selection on launch; deletion with adult gate and data removal.

## 5. Progress Dashboard

- See `requirements2.md` Section 3.5 (`FR-5.x`).
- Summary:
  - Per‑profile “My Progress” screen.
  - Topic list/grid with proficiency bands derived from recent accuracy and volume.
  - Topic detail view with best scores, accuracy, last played, and empty‑state messaging.
  - Exclusion of abandoned/very short sessions from key metrics.

## 6. Adaptive Practice (P1)

- See `requirements2.md` Section 3.6 (`FR-6.x`).
- Summary:
  - Adaptive mode using simple heuristics; no heavy ML in phase one.
  - Biased selection toward weak/unseen facts.
  - Fallback default sequences when history is insufficient.

## 7. Engagement Layer (P1)

- See `requirements2.md` Section 3.7 (`FR-7.x`).
- Summary:
  - Daily/weekly goals in terms of questions answered.
  - Streaks based on days meeting the minimum threshold.
  - Achievements with stored unlocks and in‑app celebrations.

## 8. Dash Duel (P2) & Accounts/Sync (P1–P2)

- See `requirements2.md` Sections 3.8 and 3.9.

## 9. Monetization & Access Control

- See `requirements2.md` Section 3.10 (`FR-10.x`).
- Summary:
  - Clear free vs premium content.
  - Adult‑gated upgrade flows.
  - AI credit pack handling (post‑MVP).
