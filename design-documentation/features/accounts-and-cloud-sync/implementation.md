---
title: Implementation - Accounts & Cloud Sync
description: Developer handoff notes for authentication and sync logic
feature: Accounts & Cloud Sync
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ./user-journey.md
dependencies: []
status: approved
---

# Implementation: Accounts & Cloud Sync

## Technical Requirements

### 1. Authentication
- **Provider**: Firebase Auth / Auth0 / Custom Backend.
- **Methods**: Email/Password, Social (Google).
- **Session**: Long-lived tokens (Refresh tokens).

### 2. Data Sync Strategy
- **Architecture**: Offline-first.
- **Local DB**: SQLite / Realm / WatermelonDB.
- **Remote DB**: Firestore / Postgres.
- **Sync Logic**:
  - On App Open: Pull changes.
  - On Session End: Push changes.
  - Periodic: Every 5 mins if active.

### 3. Data Models
- **User**: `uid`, `email`, `isTeacher`.
- **Profile**: `id`, `uid` (parent), `name`, `avatar`, `stats`.
- **Class**: `code`, `teacherId`, `studentIds[]`.

### 4. Conflict Resolution
- **Strategy**: Last Write Wins (LWW) for simple fields (Settings).
- **Strategy**: Union/Merge for Arrays (Completed Levels, Achievements).
- **Strategy**: Manual Resolution for Profile Metadata (Name, Avatar) if timestamps differ significantly.

## Security
- **PII**: Do not store children's real names if possible. Encourage nicknames.
- **Encryption**: TLS in transit. Encrypted at rest.
- **COPPA/GDPR-K**: Ensure "Delete Account" wipes all associated child data immediately.

## Performance
- **Optimistic UI**: Update UI immediately on local save, sync in background.
- **Retry**: Exponential backoff for failed syncs.
