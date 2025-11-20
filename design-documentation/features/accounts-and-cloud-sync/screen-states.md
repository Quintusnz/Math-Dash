---
title: Screen States - Accounts & Cloud Sync
description: Visual specifications for login, sync status, and management screens
feature: Accounts & Cloud Sync
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ../../design-system/components/forms.md
dependencies: []
status: approved
---

# Screen States: Accounts & Cloud Sync

## Screen 1: Grown-ups Dashboard (Account Tab)

### State: Guest (Default)
- **Header**: "Grown-ups Area"
- **Hero**: Illustration of Cloud/Safe.
- **Body**:
  - Text: "Sign in to save progress and play on other devices."
  - Primary Button: "Create Account / Sign In".
  - Secondary Link: "Why do I need this?"
- **Footer**: App Version, Privacy Policy Link.

### State: Signed In (Parent)
- **Header**: "Account: [Email]"
- **Body**:
  - **Sync Status Card**: "Last synced: Just now" (Green Check).
  - **Profiles Card**: List of managed child profiles.
    - Action: "Edit" / "Delete".
  - **Subscription Card**: "Free Plan" / "Premium" (Link to Monetization).
- **Actions**: "Sign Out", "Delete Account" (Red).

## Screen 2: Login / Sign Up Modal

### State: Input
- **Layout**: Centered Form (`container-sm`).
- **Fields**: Email, Password.
- **Actions**: "Sign In", "Forgot Password?", "Create Account".
- **Social**: "Continue with Apple/Google" (Platform specific).

### State: Loading
- **Overlay**: Spinner.
- **Text**: "Securing your data..."

### State: Error
- **Inline**: "Incorrect password."
- **Toast**: "Network error. Please try again."

## Screen 3: Conflict Resolution

### State: Conflict Detected
- **Title**: "Sync Conflict"
- **Body**: "We found a newer version of 'Alice' on the cloud."
- **Comparison**:
  - **Local**: "Last played: Today 10:00 AM (Level 5)"
  - **Cloud**: "Last played: Yesterday 8:00 PM (Level 4)"
- **Actions**: "Keep Local (Upload)", "Keep Cloud (Download)", "Keep Both (Alice 2)".

## Screen 4: Class Management (Teacher)

### State: Class List
- **List Item**: Class Name, Student Count, Code.
- **Action**: "Add Class".

### State: Class Detail
- **Header**: Class Name + Big Code Display.
- **Body**: Grid of Student Avatars + Weekly Activity Status.
