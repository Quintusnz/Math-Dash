# Ready Steady Math - User Flows

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

**Version:** 2.1  
**Last Updated:** November 2025  
**Status:** Active

---

## Document Change Log

This section summarises the major changes and additions made in this version of the User Flows document.

### Changes & Additions (November 2025 - v2.1)

1. **Number Range Selection for Addition & Subtraction (Section 2.2)** - New
   - Added new "Pick Your Number Zone" step for addition/subtraction operations
   - Four preset zones: Starter (up to 10), Builder (up to 20), Challenge (up to 50), Pro (up to 100)
   - Each zone displays star rating, example problems, and curriculum year hints
   - Added "More options" custom range panel for advanced adult configuration
   - Number selection (1-12 grid) retained only for multiplication/division operations

### Changes & Additions (November 2025 - v2.0)

1. **Play Code Authentication System (Section 1)** - New
   - Added complete flow for Play Code-based authentication
   - Documented three entry paths: Create Player, Enter Code, Play as Guest
   - Added Play Code generation and display flow (format: `DASH-XXXX`)

2. **Profile Creation Flow (Section 1)** - Rewritten
   - Updated age bands from UK year groups (Y1-2, etc.) to numeric ranges (4-5, 6-8, 9-12)
   - Added avatar selection as a dedicated step
   - Added Play Code reveal step after profile creation
   - Removed age-based default topic selection (deferred to future release)

3. **Game Setup Flow (Section 2)** - Rewritten
   - Documented the multi-step setup wizard with 6 steps
   - Updated mode names: "Timed" to "Dash Blitz", added "Sprint" and "Zen Practice"
   - Added input method selection (Numpad, Multiple Choice, Voice)
   - Added operation and number selection steps

4. **Parent/Grown-Ups Journey (Section 5)** - Updated
   - Clarified adult gate is planned but not yet enforced in current build
   - Updated proficiency terminology to match implementation (mastered/learning/new)
   - Added Ready Steady Math Coach subscription flow (new from PRD v2.0)

5. **Dash Duel Flow (Section 4)** - New
   - Added complete flow for two-player local multiplayer mode
   - Documented setup, gameplay, and results screens

6. **Pricing Updates (Section 5)** - Updated
   - Home/Family Core unlock: US$6.99 (one-time)
   - Added Ready Steady Math Coach subscription: US$2.99/month or US$23.99/year

7. **Error & Edge Cases (Section 6)** - Updated
   - Clarified current implementation status for offline play
   - Marked session pause/resume as planned but not yet implemented

8. **Future Flows (Section 7)** - New
   - Added section for planned features not yet implemented
   - Includes quick play, topic suggestions, teacher features

---

## 1. First-Time Setup & Authentication

This section covers the flows for new users arriving at Ready Steady Math for the first time, as well as the Play Code authentication system that allows players to access their profiles across devices.

### 1.1 Welcome Screen

When a user arrives with no active profile on the device:

1. **Landing Screen**
   - App logo and branding displayed
   - Title: "Ready to Play?"
   - Three primary actions presented:

2. **Action Options**
   - **"Create Your Player"** (Primary CTA)
     - Label: "I'm new here!"
     - Starts the profile creation flow (Section 1.2)
   - **"I Have a Code"** (Secondary CTA)
     - Label: "I've played before"
     - Opens Play Code entry screen (Section 1.3)
   - **"Play as Guest"** (Tertiary option)
     - Creates a temporary guest profile
     - Guest progress stays on device only
     - No Play Code generated

### 1.2 Create Player Flow

A multi-step wizard to create a new player profile:

**Step 1: Name Entry**
- Prompt: "What should we call you?"
- Input: Display name (2-20 characters)
- Validation: Minimum 2 characters, trimmed whitespace
- Character counter shown

**Step 2: Avatar Selection**
- Prompt: "Choose your avatar!"
- Grid of 12 emoji avatars (fox, cat, dog, bunny, panda, koala, lion, tiger, unicorn, dragon, butterfly, rocket)
- Single selection with visual checkmark
- Pre-selected default avatar

**Step 3: Age Band Selection**
- Prompt: "How old are you?"
- Helper text: "This helps us pick the right challenges"
- Options:
  - 4-5 Years (seedling emoji)
  - 6-8 Years (herb emoji)
  - 9-12 Years (tree emoji)
- Selection triggers profile creation

**Step 4: Play Code Reveal**
- Prompt: "You're all set!" with celebration emoji
- Display generated Play Code (format: `DASH-XXXX`)
- Explanation: "Here's your special Play Code. Keep it safe!"
- Visual card showing:
  - Player name and avatar
  - Play Code in large, clear format
  - Copy button for easy sharing
- CTA: "Start Playing!" - Proceeds to Dashboard

**Profile Creation (Backend)**
- Generate unique Play Code
- Create `Profile` record with:
  - `id`: UUID
  - `playCode`: Generated code
  - `displayName`: User input
  - `avatarId`: Selected emoji
  - `ageBand`: Selected range
  - `isGuest`: false
  - Default preferences (sound on, haptics on)
- Save to local database (Dexie/IndexedDB)
- Update device settings with active Play Code

### 1.3 Enter Play Code Flow

For returning players on a new device:

1. **Code Entry Screen**
   - Prompt: "Enter your Play Code"
   - Input: 4-character code (format: `DASH-XXXX`)
   - Auto-uppercase, auto-format with dash prefix
   - Visual feedback during validation

2. **Code Lookup**
   - Check if code exists in local device profiles
   - If found locally: Activate that profile
   - If not found locally: Show error "Code not found on this device"
   - Future: Cloud lookup for cross-device sync

3. **Success**
   - Brief welcome back message with player name and avatar
   - Proceed to Dashboard

4. **Error States**
   - Invalid format: "Please enter 4 letters/numbers"
   - Not found: "We couldn't find that code. Check and try again."
   - Option to create new player instead

### 1.4 Guest Play Flow

Quick start without profile creation:

1. Tap "Play as Guest"
2. System creates temporary profile:
   - Display name: "Guest Player"
   - Avatar: game controller emoji
   - No Play Code assigned
   - `isGuest`: true
3. Proceed directly to Dashboard
4. Guest limitations:
   - Progress stored locally only
   - No Play Code for cross-device access
   - Can convert to full profile later (future feature)

### 1.5 Profile Switching

When multiple profiles exist on device:

1. **Profile Selector Screen**
   - List of profiles on this device
   - Each shows: Avatar, name, last active date
   - Options:
     - Tap profile to switch
     - "Add Another Player" - Create flow
     - "Use a Different Code" - Enter code flow

2. **Switching Behaviour**
   - Update device settings with new active profile
   - Load profile's progress and preferences
   - Navigate to Dashboard

---

## 2. Game Setup & Configuration

This section covers the flow from Dashboard to starting a game session.

### 2.1 Dashboard (Home Screen)

After authentication, the player lands on their Dashboard:

**Header**
- App title: "Ready Steady Math"
- Settings icon (top right)
- Logout/Switch player icon (top right)

**Profile Banner**
- Avatar and greeting: "Hi, [Name]!"
- Play Code display (compact, tappable for full view)
- Quick action buttons:
  - **Solo Dash** (Primary) - Game Setup
  - **Duel Mode** - Dash Duel Setup

**Progress Section**
- "Your Progress" heading
- Skill Radar visualisation showing mastery across operations
- Tappable for more detail (navigates to full progress view)

### 2.2 Game Setup Wizard

A 6-step wizard to configure the game session:

**Step 1: Operation Selection**
- Prompt: "What do you want to practice?"
- Subtitle: "Choose an operation to master."
- Grid of 4 cards:
  - Addition (plus icon)
  - Subtraction (minus icon)
  - Multiplication (X icon)
  - Division (divide icon)
- Single selection; auto-advances to Step 2

**Step 2: Number Selection / Number Range**

*For Multiplication & Division:* Number Selection
- Prompt varies by operation:
  - Multiplication: "Which times tables?"
  - Division: "Which divisors?"
- Grid of numbers 1-12
- Multi-select with checkmarks
- "Select All" and "Clear" quick actions
- Selection summary shown below grid
- "Next" button (disabled until at least 1 selected)

*For Addition & Subtraction:* Number Range Selection (NEW)
- Prompt: "Pick Your Number Zone"
- Subtitle: "Choose your challenge level."
- Grid of 4 preset zone tiles:
  
  **Starter** (★)
  - Range: Up to 10
  - Examples: "7 + 3 = ?", "9 - 2 = ?"
  - Hint: Years 1–2
  
  **Builder** (★★)
  - Range: Up to 20
  - Examples: "13 + 6 = ?", "17 - 8 = ?"
  - Hint: Years 2–3
  
  **Challenge** (★★★)
  - Range: Up to 50
  - Examples: "34 + 15 = ?", "48 - 23 = ?"
  - Hint: Years 3–4
  
  **Pro** (★★★★)
  - Range: Up to 100
  - Examples: "67 + 28 = ?", "91 - 54 = ?"
  - Hint: Years 5–6

- Single selection with visual checkmark
- Default: "Starter" for new users, or last-used range for returning users
- "More options" link for advanced custom range settings (adult gate)

*Custom Range Panel (via "More options"):*
- Adult-facing settings for fine-grained control
- Range Type: "Operand range" or "Answer range"
- Min/Max value steppers (0-100)
- Subtraction: "No negative results" checkbox
- Preview problems section
- "Apply Custom Range" and "Reset to Presets" buttons

- "Next" button to proceed to Step 3

**Step 3: Mode Selection**
- Prompt: "How do you want to play?"
- Subtitle: "Choose your challenge style."
- Three mode cards:

  **Dash Blitz** (Timed)
  - Icon: Timer
  - Description: "Race against the clock! Answer as many as you can."
  - Duration configurable in Step 5

  **Sprint** (Question Count)
  - Icon: Lightning bolt
  - Description: "Speed run! Answer [X] questions as fast as possible."
  - Question count configurable in Step 5

  **Zen Practice** (Untimed)
  - Icon: Infinity symbol
  - Description: "No timer, no pressure. Just focus on getting them right."
  - No additional settings needed

- Single selection; auto-advances to Step 4

**Step 4: Input Method Selection**
- Prompt: "How do you want to answer?"
- Subtitle: "Choose your input method."
- Three input cards:

  **Number Pad**
  - Icon: Calculator
  - Description: "Type your answers using a keypad."
  - Best for: Typing practice, keyboard users

  **Multiple Choice**
  - Icon: List
  - Description: "Pick the correct answer from 5 options."
  - Best for: Quick play, younger children

  **Voice**
  - Icon: Microphone
  - Description: "Say your answers out loud!"
  - Note: Downloads ~50MB speech model on first use
  - Shows download progress if selected

- Single selection; auto-advances to Step 5

**Step 5: Settings Adjustment**
- Prompt: "Customize your game"
- Subtitle: "Adjust the settings to your liking."
- Settings vary by mode:

  **Dash Blitz:**
  - Duration slider: 30s / 40s / 50s / 60s / 70s / 80s / 90s
  - Default: 60s
  - Plus/minus buttons for accessibility

  **Sprint:**
  - Question count slider: 10 / 15 / 20 / 25 / 30 / 35 / 40 / 45 / 50
  - Default: 20 questions
  - Plus/minus buttons for accessibility

  **Zen Practice:**
  - Message: "Just relax and practice. No settings needed!"

- "Next" button to proceed

**Step 6: Ready Screen**
- Prompt: "Ready to Dash?"
- Subtitle: "Double check your setup."
- Animated mascot (Dashy) bouncing with excitement
- Summary card showing:
  - Operation: [selected]
  - Focus Numbers: [list or "All"]
  - Mode: [name + duration/count]
  - Input: [method]
- "Start Game" button (Primary CTA)
- "Back" to adjust settings

**Voice Model Loading**
- If Voice input selected and model not ready:
  - "Start Game" button shows loading state
  - Progress indicator: "Loading Voice... X%"
  - Button enabled once model ready

### 2.3 Navigation During Setup

- **Back button**: Returns to previous step
- **Progress dots**: Show current step (Steps 1-3 visible as dots)
- **Step label**: "Step X of 3" (Steps 1-3; Steps 4-6 are settings refinement)

---

## 3. Gameplay Flows

This section covers the core gameplay experience across different modes.

### 3.1 Core Play Loop (All Modes)

**Game Start**
- Generate first question based on config
- Initialize score to 0
- Start timer (if applicable)
- Begin recording session data

**Question Display**
- Single question shown prominently (e.g., "7 x 8 = ?")
- Animated entrance for each new question

**Answer Input (varies by input method)**

*Number Pad:*
- On-screen numpad with digits 0-9
- Clear button to reset input
- Submit button to check answer
- Current input displayed above pad
- Keyboard support for desktop (0-9, Enter, Backspace)

*Multiple Choice:*
- 5 answer buttons displayed
- One correct answer, 4 plausible distractors
- Tap to select and auto-submit
- Visual feedback on selected button

*Voice:*
- Microphone indicator showing listening state
- Spoken answer recognised and auto-submitted
- Visual hint showing expected answer format
- Fallback display if recognition unclear

**Feedback**
- Correct: Green flash, satisfying sound, score increment
- Incorrect: Red flash, error sound, correct answer briefly shown
- Haptic feedback on mobile (if enabled)
- Short delay (200-500ms) before next question

**End Conditions**
- Dash Blitz: Timer reaches 0
- Sprint: Target question count reached (correct answers only)
- Zen Practice: Player taps "End Practice" button

### 3.2 Dash Blitz (Timed Mode)

**During Gameplay**
- Timer bar at top showing time remaining
- Countdown display (e.g., "45s")
- Score display
- Profile chip in corner

**Final 5 Seconds**
- Tick sound each second
- Visual urgency (timer bar colour change)

**Time Up**
- "Game Over" sound
- Transition to Results Screen

### 3.3 Sprint Mode

**During Gameplay**
- Progress indicator: "X / 20" (correct answers / target)
- Progress bar fills as correct answers accumulate
- Score display
- No time pressure

**Completion**
- Triggered when correct answer count reaches target
- Transition to Results Screen

### 3.4 Zen Practice Mode

**During Gameplay**
- No timer or progress bar
- Score display (optional motivation)
- "End Practice" button always visible
- Question count tracked but not limiting

**Ending Session**
- Player taps "End Practice"
- Transition to Results Screen

### 3.5 Results Screen

**Header**
- Profile chip (player avatar and name)
- High score celebration (if applicable):
  - Bouncing mascot animation
  - "New High Score!" label

**Summary Card**
- Eyebrow: "Session summary"
- Title: "Time's Up!" (or "Great Job!" for Sprint/Zen)
- Stats grid:
  - Score: [points]
  - Accuracy: [X%]
  - Correct: [X/Y]

**Achievements**
- If new achievements unlocked:
  - "Achievements unlocked" section
  - List of achievement icons and titles
  - Celebration sound

**Actions**
- **Play Again** (Primary): Restart with same configuration
- **New Game** (Secondary): Return to Game Setup (Step 1)
- **Home** (Tertiary): Return to Dashboard

**History List**
- Below the card: Recent session history
- Scrollable list of past games

### 3.6 Mastery Tracking

Throughout gameplay, the system tracks:
- Per-fact performance (e.g., "7x8" accuracy and speed)
- Response times for adaptive difficulty (future)
- Weak facts identified for targeted practice
- Session aggregates saved to database

---

## 4. Dash Duel (Local Multiplayer)

Two players compete head-to-head on a single device.

### 4.1 Duel Setup

**Entry Point**
- Dashboard: "Duel Mode" button

**Setup Screen**
- Title: "Duel Setup"
- Split layout:

  **Player 1 Card (Left/Top)**
  - Title: "Player 1" (coloured indicator)
  - Difficulty selector: Easy / Medium / Hard
  - Affects question complexity for this player

  **VS Badge (Center)**
  - Large "VS" indicator

  **Player 2 Card (Right/Bottom)**
  - Title: "Player 2" (different colour)
  - Difficulty selector: Easy / Medium / Hard
  - Independent from Player 1

**Actions**
- "Back": Return to Dashboard
- "Start Duel!": Begin gameplay

### 4.2 Duel Gameplay

**Layout**
- Split screen (landscape) or stacked (portrait)
- Each player has their own "lane"

**Per Player Lane**
- Score display
- Current question
- Number pad input
- Independent question generation based on difficulty

**Central Timer**
- 60-second countdown
- Shared between both players
- Tick sounds in final 5 seconds

**Answer Handling**
- Each player submits independently
- Correct: Score increases, new question generated
- Incorrect: Input cleared, same question remains
- No interference between players

### 4.3 Duel Results

**Game Over Screen**
- Title: "Game Over!"
- Winner announcement:
  - "[Player X] Wins!" (if clear winner)
  - "It's a Draw!" (if tied)

**Stats Grid**
- Player 1 card:
  - Score
  - Correct answers
  - Difficulty level
- Player 2 card:
  - Score
  - Correct answers
  - Difficulty level

**Actions**
- "Rematch": Start new duel with same settings
- "Change Settings": Return to Duel Setup
- "Home": Return to Dashboard

---

## 5. Parent/Grown-Ups Area

This section covers the adult-facing features for parents and guardians.

### 5.1 Accessing Grown-Ups Area

**Entry Point**
- From Dashboard or Settings: "Grown-Ups" navigation item
- Direct URL: `/grown-ups`

**Adult Gate (Planned)**
- Simple math question (e.g., "What is 15 + 27?")
- Or long-press interaction
- *Note: Currently not enforced in implementation; direct access allowed*

### 5.2 Grown-Ups Dashboard Layout

**Sidebar Navigation**
- Logo: "Ready Steady Math Admin"
- Tabs:
  - Profiles
  - Progress
  - Premium
  - Settings

### 5.3 Profiles Tab

**Profile Manager**
- List of all child profiles on device
- Per profile:
  - Avatar and name
  - Age band
  - Play Code (if not guest)
  - Last active date
- Actions:
  - Add new profile
  - Edit profile (name, avatar)
  - Delete profile (with confirmation)

### 5.4 Progress Tab

**Profile Selector**
- Horizontal tabs showing all profiles
- Click to view that child's progress

**For Selected Profile:**

**Summary Stats Row**
- Total Sessions played
- Questions Answered (lifetime)
- Overall Accuracy percentage

**Analysis Row (Two Columns)**

*Skill Radar*
- Visual chart showing mastery across operations
- Addition, Subtraction, Multiplication, Division
- Colour-coded by proficiency

*Needs Practice*
- List of weak facts identified
- Format: "7 x 8", "6 + 9", etc.
- Based on low accuracy or slow response times
- Empty state: "No weak spots identified yet! Keep playing."

**Recent Activity**
- List of last 5 game sessions
- Per session:
  - Date
  - Score
  - Correct/Total
  - Mode

### 5.5 Premium Tab

**If Not Premium:**
- Upgrade card with benefits list:
  - All addition & subtraction facts (Make 10/20)
  - All multiplication & division facts to 12x
  - Doubles, halves & square numbers
  - Adaptive "Smart Mode"
  - Unlimited profiles
  - Detailed progress reports
- Price: US$6.99 (one-time)
- "Upgrade" button: Stripe checkout
- Disclaimer: "One-time purchase. No subscription."

**If Premium:**
- Confirmation card: "You are a Premium Member!"
- Thank you message
- All features unlocked

### 5.6 Ready Steady Math Coach (Subscription Add-On)

*Note: This is a planned feature as specified in PRD v2.0.*

**Coach Upsell (After Core Unlock)**

*Entry Points:*
- Banner in Progress tab after several sessions
- Prompt in Grown-Ups area
- Example: "We've spotted some useful patterns in [Child]'s results. Unlock Ready Steady Math Coach to get a simple weekly plan."

**Coach Benefits Screen**
- Skill snapshot per child
- AI-generated weekly practice plans
- Progress over time visualisations
- Monthly coach reports
- Parent-facing explanations

**Pricing**
- Monthly: US$2.99/month
- Annual: US$23.99/year (~US$2/month, "2 months free")
- Requires Core unlock first

**Coach Dashboard (For Subscribers)**
- Per-child view:
  - Header: Child name, avatar, current streak
  - Skill Snapshot: Visual grid of current proficiency
  - This Week's Plan: 2-3 recommended sessions with "Start" buttons
  - Progress Summary: Monthly stats, link to detail
  - Latest Coach Report: Summary with key insights

### 5.7 Settings Tab

**Data Management**
- Export Data (JSON): Download all local data
- Reset App: Delete all data with confirmation

**Future Settings**
- Notification preferences
- Theme selection
- Sound/haptics defaults

### 5.8 Upgrade Flow

**Trigger Points**
- Locked topics in game setup (future)
- Premium tab in Grown-Ups area
- Locked features (Adaptive Mode, extended topics)

**Flow**
1. User taps upgrade CTA
2. *(Planned)* Adult gate confirmation
3. Benefits screen displayed
4. "Upgrade" button initiates Stripe checkout
5. Redirect to Stripe payment page
6. On success: Return to app with `?success=true`
7. App enables premium flag
8. Confirmation message displayed
9. Premium content unlocked

---

## 6. Error and Edge Case Flows

### 6.1 Offline Behaviour

**Current Implementation (Local-First)**
- All gameplay works offline
- Profiles stored in IndexedDB (Dexie)
- Sessions and attempts saved locally
- No internet required for core features

**On Reconnection (Planned)**
- Background sync queue processes pending uploads
- Minimal UI feedback: "Progress synced"
- Conflict resolution: Last-write-wins for most data

### 6.2 Session Interrupted

**Current Behaviour**
- If app loses focus (tab switch, home button):
  - Timer continues running
  - Session continues when focus returns
  - No pause/resume modal

**Planned Behaviour (Future)**
1. App detects focus loss during active session
2. Timer pauses immediately
3. Session flagged as "paused"
4. On return:
   - Modal: "Welcome back! Resume where you left off?"
   - Options: "Resume" or "Start Over"
5. Resume: Continue with remaining time/questions
6. Start Over: End current session (marked as abandoned), begin new

### 6.3 Profile Deletion

**Flow**
1. Grown-Ups: Profiles tab
2. Select profile to manage
3. Tap "Delete Profile"
4. Warning modal:
   - "Are you sure?"
   - Explains: All progress will be permanently deleted
   - Profile name shown for confirmation
5. *(Planned)* Adult gate confirmation
6. Confirm deletion
7. Profile and all associated data removed:
   - Profile record
   - Game sessions
   - Question attempts
   - Mastery records
   - Achievements

### 6.4 Play Code Not Found

**Scenario**: User enters valid-format code that doesn't exist on device

**Current Behaviour**
- Error message: "We couldn't find that code."
- Suggestion to check code and try again
- Option to create new player instead

**Future Behaviour (With Cloud Sync)**
- Check local database first
- If not found, query cloud service
- If found in cloud: Download profile to device
- If not found anywhere: Current error message

### 6.5 Voice Recognition Failures

**Model Not Loaded**
- "Start Game" button disabled until model ready
- Progress indicator shows download status
- Estimated: ~50MB download on first use

**Recognition Unclear**
- Visual hint shows expected answer
- Automatic retry listening
- Fallback: No answer registered, player speaks again

**Microphone Permission Denied**
- Error message explaining need for permission
- Link to browser/device settings
- Option to switch to different input method

---

## 7. Future Flows (Planned)

This section documents features described in the PRD but not yet implemented.

### 7.1 Quick Play

**Concept**
- "Play" button on Dashboard starts immediately with last-used configuration
- No setup wizard required
- Minimal confirmation: "Play [Operation] [Mode]?"

**Status**: Not implemented. Currently always shows full Game Setup wizard.

### 7.2 Topic Suggestions

**Concept**
- After game session, show intelligent suggestion:
  - "Great job on 5x table! Ready to try 6x?"
  - "You're getting faster at 7x8. Keep it up!"
- Based on mastery data and progression

**Status**: Not implemented. Results screen shows static actions only.

### 7.3 Age-Based Defaults

**Concept**
- New profiles get recommended topics based on age band:
  - 4-5 years: Addition to 10, counting
  - 6-8 years: Addition/subtraction to 20, 2x-5x tables
  - 9-12 years: All tables, division, squares

**Status**: Not implemented. All users see full topic selection.

### 7.4 Teacher Journey

**Concept (Post-MVP)**

*Teacher Account Creation:*
- Sign up with email/password
- Optional school name
- Teacher-specific terms acceptance

*Class Management:*
- Create class with name/year group
- Generate class code for pupils
- View class roster

*Pupil Join Flow:*
- Pupils select "I have a class code"
- Enter class code (different from Play Code)
- Create profile linked to class

*Class Dashboard:*
- Aggregate view by topic
- Proficiency distribution (how many at each level)
- Per-pupil drill-down
- Export for reporting

**Status**: Schema supports `classroomId` but no UI implemented.

### 7.5 Locked Content Indicators

**Concept**
- Free tier shows limited topics
- Locked topics display lock icon
- Tapping locked content shows upgrade teaser
- Clear visual distinction between free and premium

**Status**: Partially implemented. Premium flag exists but topic locking UI not built.

### 7.6 Streaks and Goals

**Concept**
- Daily streak: Consecutive days with at least one session
- Weekly goals: "Answer 200 questions this week"
- Visual indicators on Dashboard
- Streak-break warnings

**Status**: Schema supports streaks. Basic tracking exists but no prominent UI.

---

## 8. Flow Diagrams (Textual)

### 8.1 Authentication Flow

```
App Launch
    |
    +-- No profiles on device --> Welcome Screen
    |                                  |
    |                           +------+------+
    |                           v      v      v
    |                        Create  Enter   Guest
    |                        Player  Code    Play
    |                           |      |      |
    |                           v      v      v
    |                        Profile  Code   Temp
    |                        Wizard   Entry  Profile
    |                           |      |      |
    |                           +------+------+
    |                                  v
    |                              Dashboard
    |
    +-- Profile(s) on device --> Profile Selector --> Dashboard
```

### 8.2 Core Play Loop

```
Dashboard --> Solo Dash --> Game Setup Wizard
                                   |
                           +-------+-------+
                           v               v
                       Operation --> Numbers --> Mode --> Input --> Settings --> Ready
                                                                                   |
                                                                                   v
                                                                              Start Game
                                                                                   |
                                                                                   v
                                                        +-------------------------------------+
                                                        |          GAMEPLAY LOOP              |
                                                        |  Generate Question                  |
                                                        |       v                             |
                                                        |  Display Question                   |
                                                        |       v                             |
                                                        |  Await Answer                       |
                                                        |       v                             |
                                                        |  Check & Feedback                   |
                                                        |       v                             |
                                                        |  [If end condition met] --> Exit   |
                                                        |       |                             |
                                                        |       +--> Next Question --> Loop  |
                                                        +-------------------------------------+
                                                                                   |
                                                                                   v
                                                                            Results Screen
                                                                                   |
                                                        +--------------------------+--------------------------+
                                                        v                          v                          v
                                                   Play Again              New Game                      Home
                                                  (same config)           (setup wizard)              (dashboard)
```

### 8.3 Upgrade Flow

```
Upgrade Trigger (Grown-Ups Area / Locked Content)
    |
    v
Benefits Screen
    |
    +-- "Not Now" --> Return to previous screen
    |
    +-- "Upgrade" --> [Adult Gate - Planned] --> Stripe Checkout
                                                      |
                                                      v
                                               Payment Page
                                                      |
                                         +------------+------------+
                                         v                         v
                                     Success                    Cancel
                                         |                         |
                                         v                         v
                                   Confirmation              Return to app
                                   Premium enabled           (no change)
```

### 8.4 Dash Duel Flow

```
Dashboard --> Duel Mode --> Duel Setup
                                |
                          +-----+-----+
                          v           v
                     P1 Config    P2 Config
                     (difficulty) (difficulty)
                          |           |
                          +-----+-----+
                                v
                          Start Duel
                                |
                                v
                    +-----------------------+
                    |     DUEL GAMEPLAY     |
                    |                       |
                    |   +-----+-----+       |
                    |   | P1  | P2  |       |
                    |   |Lane |Lane |       |
                    |   +-----+-----+       |
                    |         |             |
                    |    60s Timer          |
                    +-----------------------+
                                |
                                v
                          Results Screen
                                |
                    +-----------+-----------+
                    v           v           v
                 Rematch    Settings      Home
```

### 8.5 Parent Progress Check

```
Dashboard --> Grown-Ups --> [Adult Gate - Planned]
                                      |
                                      v
                            Grown-Ups Dashboard
                                      |
                                      v
                               Progress Tab
                                      |
                                      v
                             Select Child Profile
                                      |
                    +-----------------+-----------------+
                    v                 v                 v
              Stats Summary      Skill Radar      Weak Facts
                    |                 |                 |
                    +-----------------+-----------------+
                                      v
                             Recent Activity List
```

---

## Appendix: Terminology

| Term | Definition |
|------|------------|
| Play Code | Unique 4-character identifier (DASH-XXXX) for accessing a profile |
| Dash Blitz | Timed game mode (answer as many as possible in set time) |
| Sprint | Question-count mode (answer X questions as fast as possible) |
| Zen Practice | Untimed practice mode |
| Skill Radar | Visual chart showing mastery across math operations |
| Mastery | Per-fact tracking of accuracy and speed |
| Weak Facts | Facts with low accuracy or slow response times |
| Core Unlock | One-time purchase to unlock all game content |
| Ready Steady Math Coach | Subscription add-on for AI-powered parent guidance |
| Adult Gate | Verification step to confirm adult access (e.g., math question) |
