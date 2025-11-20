---
title: Interactions - Accounts & Cloud Sync
description: Interaction patterns for authentication and data management
feature: Accounts & Cloud Sync
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ./screen-states.md
dependencies: []
status: approved
---

# Interactions: Accounts & Cloud Sync

## Authentication Flow

### 1. Adult Gating
**Trigger**: Tapping "Grown-ups" or Locked Feature.
**Interaction**:
- Modal slides up.
- Challenge: "What is 7 + 5?" or "Hold button for 3 seconds".
- **Success**: Access granted.
- **Fail**: Shake animation, "Try again".

### 2. Sign In
**Trigger**: Submit Login Form.
**Interaction**:
- Button goes to Loading state.
- Keyboard dismisses.
- **Success**: Modal closes, Toast "Signed in successfully", Dashboard updates.

## Sync Feedback

### 1. Background Sync
**Visual**: Small rotating sync icon in "Grown-ups" header.
**Completion**: Icon stops, turns to Green Check for 2s, then fades.

### 2. Manual Sync
**Trigger**: Pull-to-refresh on Dashboard.
**Interaction**: Standard spinner.

## Data Management

### 1. Delete Profile
**Trigger**: Tap "Delete" on Profile Card.
**Interaction**:
- **Alert Dialog**: "Are you sure? This cannot be undone."
- **Action**: Confirm (Red).
- **Feedback**: Profile card slides out (collapse height) and disappears.

### 2. Sign Out
**Trigger**: Tap "Sign Out".
**Interaction**:
- **Action Sheet**: "Keep data on this device?" (Yes/No).
- **Result**: Return to Guest state.
