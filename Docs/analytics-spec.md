# Math Dash – Analytics Specification

## 1. Principles

- Measure usage and learning outcomes without collecting unnecessary PII.
- Support product decisions (engagement, conversion, learning impact).
- Provide enough data for advanced AI features later, while keeping costs bounded.

## 2. Event Model

Each event includes:

- `eventName` (string).
- `timestamp` (ISO).
- `deviceId` (pseudonymous).
- `playerProfileId` (optional, local ID only).
- `sessionId` (where applicable).
- Minimal contextual properties.

Sample events (non‑exhaustive):

- `app_opened`
- `app_closed`
- `profile_created`
- `profile_deleted`
- `session_started`
- `session_completed`
- `session_abandoned`
- `topic_selected`
- `mode_selected`
- `upgrade_modal_shown`
- `upgrade_started`
- `upgrade_completed`
- `ai_action_invoked` (post‑MVP)
- `ai_action_completed` (post‑MVP)

## 3. Data Minimisation

- Do not log full question/answer content where unnecessary; use IDs.
- Avoid logging sensitive text fields like profile names in analytics where feasible.
- Ensure opt‑out toggles analytics collection on the device.

## 4. Storage & Transport

- Client batches events and sends them to a central analytics backend when online.
- If offline, events buffered locally and flushed on reconnect.
- All transport via HTTPS.

## 5. Opt‑Out & Governance

- Adult settings include:
  - Analytics on/off (opt‑out).
  - Link to privacy policy.
- Compliance:
  - Ensure data handling is compatible with COPPA/GDPR‑K guidance.
