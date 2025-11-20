---
title: Accessibility - Accounts & Cloud Sync
description: Accessibility considerations for account management
feature: Accounts & Cloud Sync
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../../accessibility/guidelines.md
dependencies: []
status: approved
---

# Accessibility: Accounts & Cloud Sync

## Specific Considerations

### 1. Adult Gating
- **Cognitive Load**: The "Adult Gate" (math problem) must be solvable but not difficult.
- **Alternative**: Provide a non-cognitive alternative if possible (e.g., "Press and hold") for adults with dyscalculia, though this is a math app, the gate is for *adults*.
- **Screen Readers**: Ensure the challenge is announced clearly. "What is seven plus five?".

### 2. Form Accessibility
- **Labels**: All login fields must have visible labels.
- **Error Handling**: Errors must be announced via `aria-live="polite"`.
- **Autocomplete**: Support `autocomplete="email"`, `autocomplete="current-password"` to help password managers.

### 3. Status Indicators
- **Sync Status**: Do not rely on color (Green/Red) alone. Use icons (Check/Exclamation) and text labels.
- **Loading**: Ensure loading spinners have `role="status"` and `aria-label="Loading"`.

### 4. Conflict Resolution
- **Clarity**: The difference between "Local" and "Cloud" versions must be very clear textually, not just visually (Left/Right).
- **Focus Management**: When the Conflict Modal appears, focus must move to the modal header.
