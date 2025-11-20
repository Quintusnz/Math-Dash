---
title: User Journey - Accounts & Cloud Sync
description: User flows for creating adult accounts, syncing data, and managing classes
feature: Accounts & Cloud Sync
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ../monetization-and-access-control/user-journey.md
dependencies: []
status: approved
---

# User Journey: Accounts & Cloud Sync

## 1. User Experience Analysis
**Primary User Goal**: Parents/Teachers want to back up progress and manage multiple children/students across devices.
**Success Criteria**: Successful login, data sync without conflict, easy profile restoration.
**Key Pain Points**: Fear of losing progress, complex setup, privacy concerns.
**Personas**: Parent (Admin), Teacher (Admin), Child (Beneficiary).

## 2. Information Architecture
- **Entry Point**: "Grown-ups" Area (Gated).
- **Structure**:
  - Account Status (Signed In / Guest)
  - Sync Settings
  - Class Management (Teacher only)
  - Data Privacy (Delete Data)

## 3. User Journey Mapping

### Flow A: Parent Account Creation (Sync Setup)
**Step 1: Discovery**
- **Trigger**: Parent enters "Grown-ups" area or taps "Sync Progress" on a new device.
- **Gate**: Adult verification (simple math question).
- **Value Prop**: "Keep their progress safe and play on any device."

**Step 2: Sign Up / Sign In**
- **Action**: Enter Email + Password (or Social Login).
- **Privacy**: Explicit consent for data processing.
- **Feedback**: "Account Created" / "Welcome Back".

**Step 3: Sync & Merge**
- **Scenario**: Local profiles exist on device.
- **System Action**: Upload local profiles to cloud.
- **Conflict**: If cloud has profiles, prompt to Merge or Replace.
- **Result**: Unified list of profiles available.

### Flow B: Teacher Class Setup
**Step 1: Create Class**
- **Action**: Teacher selects "Create Class".
- **Input**: Class Name (e.g., "Year 3 Lions").
- **Output**: Unique Class Code (e.g., `LION-342`).

**Step 2: Student Onboarding**
- **Action**: Student enters Class Code on their device (or Teacher adds them manually).
- **Result**: Student profile linked to Class Dashboard.

### Flow C: Data Recovery
**Step 1: New Device**
- **Action**: Parent opens app on Tablet B (via Browser).
- **Action**: Signs in.
- **Result**: All child profiles appear instantly.

## 4. Edge Cases
- **Offline**: Account creation fails gracefully. Sync queues for later.
- **Conflict**: "We found two versions of 'Tom'. Which one is correct?" (Timestamp comparison).
- **Logout**: "Data will remain on this device but stop syncing." vs "Remove data from this device."
