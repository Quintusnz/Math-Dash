# Math Dash Authentication System

> **Document Version**: 1.0  
> **Last Updated**: November 26, 2025  
> **Status**: Approved for Implementation

## Overview

Math Dash uses a **kid-safe, passwordless authentication system** built around unique **Play Codes**. This approach prioritizes child safety by not requiring email addresses or personal information while maintaining ease of use for children, parents, and teachers.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Play Code System](#play-code-system)
3. [Profile Types](#profile-types)
4. [User Flows](#user-flows)
5. [Multi-Profile & Device Sharing](#multi-profile--device-sharing)
6. [Classroom System](#classroom-system)
7. [Data Storage Architecture](#data-storage-architecture)
8. [Security Considerations](#security-considerations)
9. [Terminology Guide](#terminology-guide)

---

## Core Concepts

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **No Personal Data Required** | No email, phone, or real name needed to play |
| **Kid-Friendly** | Simple code entry, fun terminology, visual profiles |
| **Local-First** | All data stored on device, cloud sync optional |
| **Family Sharing** | Multiple profiles on one device |
| **Classroom Ready** | Teachers can create and manage student profiles |
| **Recoverable** | Optional email backup for code recovery |

### Key Terminology

| Traditional Term | Math Dash Term |
|-----------------|----------------|
| Sign Up | **Create Your Player** |
| Login | **Enter Your Code** |
| Password | **Play Code** |
| Account | **Player Profile** |
| Username | **Display Name** |

---

## Play Code System

### Code Format

```
DASH-XXXX

Where:
- DASH = Fixed prefix (brand identifier)
- XXXX = 4 alphanumeric characters (A-Z, 0-9)
```

**Examples**:
- `DASH-7K9M`
- `DASH-A2X5`
- `DASH-P3N8`

### Code Specifications

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| **Length** | 4 characters (after prefix) | Easy to type, remember, and write down |
| **Character Set** | A-Z, 0-9 (36 characters) | Avoids confusing similar letters |
| **Case Sensitivity** | **No** (case-insensitive) | Reduces errors for kids |
| **Total Combinations** | 36^4 = **1,679,616** | Sufficient for initial scale |
| **Format Display** | `DASH-XXXX` | Consistent, branded appearance |

### Characters to Avoid (Future Consideration)

To reduce confusion, consider excluding visually similar characters:
- `0` (zero) vs `O` (letter O)
- `1` (one) vs `I` (letter I) vs `L` (letter L)
- `5` (five) vs `S` (letter S)

### Code Generation Rules

1. Codes are generated server-side (or locally with sync validation)
2. Each code is globally unique
3. Codes are permanent (never expire, never recycled)
4. Codes are assigned to exactly one profile

---

## Profile Types

### 1. Personal Profile

Created by individual users (kids or parents) for home use.

| Attribute | Details |
|-----------|---------|
| **Created By** | User (kid/parent) |
| **Has Play Code** | ✅ Yes |
| **Cloud Sync** | Optional (user choice) |
| **Belongs to Classroom** | ❌ No |
| **Data Ownership** | User owns all data |

### 2. Classroom Profile

Created by teachers for students within a managed classroom.

| Attribute | Details |
|-----------|---------|
| **Created By** | Teacher |
| **Has Play Code** | ✅ Yes |
| **Cloud Sync** | ✅ Automatic (required) |
| **Belongs to Classroom** | ✅ Yes |
| **Data Ownership** | Visible to teacher, owned by student |

### 3. Guest Profile

Temporary profile for trying the app without commitment.

| Attribute | Details |
|-----------|---------|
| **Created By** | System (automatic) |
| **Has Play Code** | ❌ No |
| **Cloud Sync** | ❌ No |
| **Belongs to Classroom** | ❌ No |
| **Data Ownership** | Device-local only |
| **Data Migration** | ✅ Can convert to Personal Profile |

---

## User Flows

### Flow 1: App Launch (Profile Selection)

```
[App Opens]
       ↓
[Check for existing profiles on device]
       ↓
   ┌───┴───┐
   ↓       ↓
NO PROFILES    1+ PROFILES FOUND
   ↓              ↓
[Welcome      [Profile Selector Screen]
 Screen]      "Who's Playing?"
              - Show all local profiles
              - "+ Add Player" option
              - "Use a Different Code" option
              - "Play as Guest" option
```

### Flow 2: New Player Creation

```
[User taps "Create Your Player"]
       ↓
[Step 1: Choose Display Name]
- Text input (max 20 characters)
- Fun placeholder: "What should we call you?"
- Validation: No profanity, no special characters
       ↓
[Step 2: Choose Avatar]
- Grid of mascot/avatar options
- Visual selection (tap to choose)
       ↓
[Step 3: Your Play Code]
- Display generated code prominently: DASH-XXXX
- "This is YOUR special code!"
- [Copy Code] button
- [Save Code to Email] optional - sends to parent email
- Instruction: "Write this down or ask a grown-up to save it!"
       ↓
[Step 4: Ready to Play!]
- Profile saved to device
- Redirect to home/play screen
```

### Flow 3: Returning Player (Enter Code)

```
[User taps "I Have a Code"]
       ↓
[Code Entry Screen]
- Large input field
- Auto-formats as user types: DASH-____
- Keyboard optimized for alphanumeric
       ↓
[User submits code]
       ↓
   ┌───┴───┐
   ↓       ↓
CODE VALID     CODE INVALID
   ↓              ↓
[Fetch profile   [Error message]
 from cloud]     "Hmm, we can't find that code.
   ↓              Check and try again!"
[Save to device]
   ↓
[Welcome back, {Name}!]
   ↓
[Home screen]
```

### Flow 4: Guest Play

```
[User taps "Play as Guest"]
       ↓
[Create temporary local profile]
- Default name: "Guest Player"
- Random avatar assigned
- No code generated
       ↓
[Play game normally]
- All progress saved locally
- Prompted periodically: "Want to save your progress?"
       ↓
[If user creates profile later]
- "Would you like to keep your Guest progress?"
- [Yes, keep it] → Migrate data to new profile
- [No, start fresh] → New profile, guest data stays separate
```

### Flow 5: Profile Switching

```
[User on home screen]
       ↓
[Taps profile avatar/name]
       ↓
[Profile Selector Screen]
       ↓
   ┌───┴───────────────┐
   ↓                   ↓
SETTING: "Require      SETTING: "Require
Code" = OFF            Code" = ON
   ↓                      ↓
[Tap profile to       [Tap profile]
 switch instantly]        ↓
                      [Enter code for this profile]
                          ↓
                      [Validate → Switch]
```

**Note**: "Require Code" setting should default to ON for classroom-managed profiles and shared devices.

---

## Multi-Profile & Device Sharing

### Household Scenario (Shared Family Tablet)

Multiple children in one household can each have their own profile on a shared device.

```
Device: Family iPad
├── Profile 1: Emma (DASH-7K9M) - Created on this device
├── Profile 2: Lucas (DASH-P3N8) - Created on this device  
└── Profile 3: Sophie (DASH-T2M4) - Logged in from different device
```

### How Profiles Are Added

1. **Create New**: Profile created directly on this device → Code generated → Saved locally + cloud
2. **Login Existing**: Code entered → Profile fetched from cloud → Saved locally

### Profile Selector UI

```
┌─────────────────────────────────────────────────────────┐
│  Who's Playing Today?                                   │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │   🦊    │  │   🐱    │  │   🐶    │  │   ➕    │    │
│  │  Emma   │  │  Lucas  │  │ Sophie  │  │  Add    │    │
│  │         │  │         │  │         │  │ Player  │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                         │
│  ───────────────────────────────────────────────────    │
│  [🔑 Use a Different Code]        [👤 Play as Guest]    │
└─────────────────────────────────────────────────────────┘
```

### Device Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Require code to switch | OFF (personal) / ON (classroom) | Adds code verification when switching profiles |
| Remember last player | ON | Auto-selects the last active profile |
| Allow guest play | ON | Shows guest option on selector |

---

## Classroom System

### Overview

Teachers can create and manage a classroom, generate Play Codes for students, and view student progress.

### Teacher Account

Teachers authenticate separately (email + password or OAuth) to access the Teacher Dashboard. This is distinct from student Play Codes.

### Classroom Structure

```
Classroom
├── classroomId: "uuid-or-generated-id"
├── classroomName: "Mrs. Johnson's 3rd Grade Math"
├── teacherId: [reference to teacher account]
├── createdAt: timestamp
├── settings:
│   ├── requireCodeToSwitch: true
│   └── allowStudentNameChange: false
│
└── students: [
      {
        playCode: "DASH-A1B2",
        displayName: "Student 1",
        avatar: "fox",
        joinedAt: timestamp,
        isClassroomManaged: true,
        status: "active"
      },
      ...
    ]
```

### Teacher Workflows

#### Creating Student Profiles

```
[Teacher Dashboard]
       ↓
[Select Classroom]
       ↓
[Click "Add Students"]
       ↓
[Option A: Bulk Create]
- Enter number of students
- System generates X codes
- Teacher assigns names (or leaves as "Student 1", etc.)
       ↓
[Option B: Single Create]
- Enter student display name
- System generates 1 code
       ↓
[Codes Generated]
       ↓
[Distribution Options]
- [Print Code Cards] → PDF with individual cards
- [Export to CSV] → Spreadsheet for records
- [Email to Parents] → If parent emails provided
```

#### Student Code Card (Printable)

```
┌─────────────────────────────────┐
│  🎮 MATH DASH                   │
│                                 │
│  Player: Emma                   │
│  Class: Mrs. Johnson's Math     │
│                                 │
│  Your Play Code:                │
│  ┌─────────────────────────┐    │
│  │      DASH-7K9M          │    │
│  └─────────────────────────┘    │
│                                 │
│  Go to mathdash.app             │
│  Tap "I Have a Code"            │
│  Enter your code and play!      │
│                                 │
│  [QR CODE - Future Feature]     │
└─────────────────────────────────┘
```

#### Viewing Student Progress

```
[Teacher Dashboard]
       ↓
[Select Classroom]
       ↓
[Student Progress View]
┌──────────────────────────────────────────────────────────┐
│ Student      │ Play Code   │ Last Active │ Games │ Avg  │
│──────────────│─────────────│─────────────│───────│──────│
│ Emma         │ DASH-7K9M   │ Today       │ 24    │ 85%  │
│ Lucas        │ DASH-P3N8   │ Yesterday   │ 18    │ 72%  │
│ Sophie       │ DASH-T2M4   │ 3 days ago  │ 31    │ 91%  │
└──────────────────────────────────────────────────────────┘
```

### Classroom Profile Behaviors

| Scenario | Behavior |
|----------|----------|
| Student uses code at school | Profile loads on school device |
| Student uses code at home | Same profile syncs, progress shared |
| Student moves schools | Teacher can "release" profile; student keeps code |
| Code lost | Teacher can view/reissue code from dashboard |

---

## Data Storage Architecture

### Local Storage (IndexedDB via Dexie)

All user data is stored locally first, following the local-first architecture.

```
IndexedDB Database: "MathDashDB"
│
├── profiles
│   ├── id: string (playCode or local UUID for guests)
│   ├── playCode: string | null (null for guests)
│   ├── displayName: string
│   ├── avatar: string
│   ├── createdAt: Date
│   ├── lastPlayedAt: Date
│   ├── isGuest: boolean
│   ├── classroomId: string | null
│   └── syncStatus: "local" | "synced" | "pending"
│
├── deviceProfiles
│   └── knownCodes: string[] (list of codes used on this device)
│
├── deviceSettings
│   ├── lastActiveProfile: string (playCode)
│   ├── requireCodeToSwitch: boolean
│   └── theme: string
│
├── gameHistory
│   ├── id: auto-increment
│   ├── profileId: string (playCode)
│   ├── gameMode: string
│   ├── score: number
│   ├── accuracy: number
│   ├── duration: number
│   ├── completedAt: Date
│   └── details: JSON
│
├── skillProgress
│   ├── profileId: string (playCode)
│   ├── skillId: string
│   ├── level: number
│   ├── xp: number
│   └── lastPracticed: Date
│
└── achievements
    ├── profileId: string (playCode)
    ├── achievementId: string
    └── unlockedAt: Date
```

### Cloud Storage (Sync)

Cloud sync is optional for personal profiles, required for classroom profiles.

```
Cloud Database
│
├── profiles/{playCode}
│   └── [Same structure as local, minus device-specific fields]
│
├── classrooms/{classroomId}
│   ├── metadata
│   └── studentCodes[]
│
├── teachers/{teacherId}
│   ├── email
│   ├── classrooms[]
│   └── subscription
│
└── codeRegistry
    └── {playCode}: profileId (ensures global uniqueness)
```

### Sync Logic

```
[Local Change Made]
       ↓
[Save to IndexedDB immediately]
       ↓
[Queue for sync (if enabled)]
       ↓
[Background sync to cloud]
       ↓
[Update syncStatus: "synced"]
```

---

## Security Considerations

### Play Code Security

| Risk | Mitigation |
|------|------------|
| Code guessing | 1.67M combinations; rate limiting on attempts |
| Code sharing | By design - codes CAN be shared (family feature) |
| Code theft | No sensitive data tied to profile; teacher can reset |
| Lost code | Email backup option; teacher can view/reissue |

### Data Privacy

| Data Type | Storage | Shared With |
|-----------|---------|-------------|
| Display Name | Local + Cloud | Teacher (if classroom) |
| Avatar Choice | Local + Cloud | Teacher (if classroom) |
| Game Progress | Local + Cloud | Teacher (if classroom) |
| Email (recovery) | Cloud only | No one (encrypted) |
| Device Info | Local only | No one |

### COPPA Compliance Notes

- No email required from children
- No personal information collected
- Parent/guardian email optional (for code recovery only)
- Classroom profiles managed by verified teachers
- No advertising or tracking

---

## Terminology Guide

### User-Facing Copy

| Context | Copy |
|---------|------|
| Initial welcome | "Ready to Play?" |
| New user CTA | "Create Your Player" |
| Returning user CTA | "I Have a Code" |
| Guest CTA | "Play as Guest" |
| Code label | "Your Play Code" |
| Code entry prompt | "Enter Your Code" |
| Code display instruction | "This is YOUR special code! Keep it safe." |
| Code save prompt | "Write this down or ask a grown-up to save it!" |
| Profile selector title | "Who's Playing Today?" |
| Add profile | "Add Player" |
| Switch profile | "Switch Player" |
| Error: invalid code | "Hmm, we can't find that code. Check and try again!" |
| Success: code entered | "Welcome back, {Name}!" |
| Guest conversion prompt | "Want to save your progress? Create your player now!" |
| Guest data migration | "Would you like to keep your Guest progress?" |

### Internal/Technical Terms

| User Term | Technical Term |
|-----------|---------------|
| Play Code | `playCode` |
| Player Profile | `Profile` entity |
| Display Name | `displayName` |
| Guest | `isGuest: true` |
| Classroom | `Classroom` entity |

---

## Future Enhancements

### Phase 2 Considerations

- [ ] **QR Code Support**: Scan to login (reduces typing for young kids)
- [ ] **Picture Password**: Alternative to alphanumeric codes
- [ ] **Family Groups**: Link multiple profiles under one parent account
- [ ] **Code Refresh**: Allow users to request a new code (old one deactivated)
- [ ] **Biometric Lock**: Optional fingerprint/face ID for profile switching

### Scalability

If user base exceeds 1.5M, extend code format:
- Option A: `DASH-XXXXX` (5 chars = 60M combinations)
- Option B: `DASH-XXXX-XX` (6 chars = 2B combinations)

---

## Appendix

### A. Code Generation Algorithm (Pseudo-code)

```javascript
function generatePlayCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes 0,O,1,I,L,S,5
  let code = 'DASH-';
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Verify uniqueness against code registry
  if (await codeExists(code)) {
    return generatePlayCode(); // Retry
  }
  
  return code;
}
```

### B. Profile Data Schema (TypeScript)

```typescript
interface Profile {
  playCode: string | null;      // null for guest profiles
  displayName: string;
  avatar: string;
  createdAt: Date;
  lastPlayedAt: Date;
  isGuest: boolean;
  classroomId: string | null;   // null for personal profiles
  syncStatus: 'local' | 'synced' | 'pending';
}

interface Classroom {
  classroomId: string;
  classroomName: string;
  teacherId: string;
  createdAt: Date;
  settings: {
    requireCodeToSwitch: boolean;
    allowStudentNameChange: boolean;
  };
  studentCodes: string[];
}
```

### C. Related Documents

- [User Flows](./user-flows.md)
- [Technical Architecture](./technical-architecture.md)
- [Information Architecture](./information-architecture.md)
- [Product Overview](./product-overview.md)

---

*Document maintained by the Math Dash Product Team*
