# Ready Steady Math – Component Catalog

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.

This document serves as the reference for the frontend component library. It maps the Design System to actual React components, defining their props, variants, and behavior.

## 1. Atomic Components (`src/components/ui`)

### 1.1 Button
The primary interactive element.
*   **Props:**
    *   `variant`: `'primary' | 'secondary' | 'ghost' | 'danger'`
    *   `size`: `'sm' | 'md' | 'lg' | 'xl'`
    *   `isLoading`: `boolean`
    *   `icon`: `ReactNode` (Left icon)
    *   `fullWidth`: `boolean`
*   **Usage:**
    ```tsx
    <Button variant="primary" size="lg" onClick={startRound}>
      Start Dash
    </Button>
    ```

### 1.2 Card
A container for grouping content.
*   **Props:**
    *   `variant`: `'default' | 'elevated' | 'interactive'`
    *   `padding`: `'none' | 'sm' | 'md' | 'lg'`
*   **Usage:**
    ```tsx
    <Card variant="elevated" padding="md">
      <Typography variant="h3">Topic Name</Typography>
    </Card>
    ```

### 1.3 Typography
Enforces the type scale.
*   **Props:**
    *   `variant`: `'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label'`
    *   `color`: `'default' | 'muted' | 'primary' | 'error'`
    *   `as`: `ElementType` (e.g., 'h1', 'span', 'p')

### 1.4 Badge / Chip
Used for status indicators (e.g., "Locked", "Mastered").
*   **Props:**
    *   `variant`: `'success' | 'warning' | 'error' | 'info' | 'neutral'`
    *   `size`: `'sm' | 'md'`

### 1.5 Avatar
Displays user profile image.
*   **Props:**
    *   `src`: `string` (Asset ID or URL)
    *   `size`: `'sm' | 'md' | 'lg' | 'xl'`
    *   `status`: `'online' | 'offline'` (Optional)

---

## 2. Game Components (`src/components/game`)

### 2.1 GameCanvas
The main layout wrapper for the gameplay screen. Handles aspect ratio and centering.
*   **Props:**
    *   `children`: `ReactNode`
    *   `background`: `'default' | 'intense'`

### 2.2 TimerBar
Visual representation of time remaining.
*   **Props:**
    *   `duration`: `number` (ms)
    *   `remaining`: `number` (ms)
    *   `isPaused`: `boolean`
    *   `onExpire`: `() => void`

### 2.3 QuestionDisplay
Renders the current math problem.
*   **Props:**
    *   `prompt`: `string` (e.g., "7 x 8")
    *   `size`: `'normal' | 'large'`

### 2.4 AnswerGrid
Layout for the answer buttons.
*   **Props:**
    *   `options`: `Array<{ id: string, value: string }>`
    *   `onSelect`: `(id: string) => void`
    *   `disabled`: `boolean`
    *   `columns`: `2 | 3 | 4`

### 2.5 FeedbackOverlay
Full-screen flash for correct/incorrect answers.
*   **Props:**
    *   `type`: `'correct' | 'incorrect' | null`
    *   `message`: `string` (Optional)

---

## 3. Feature Components (`src/components/features`)

### 3.1 ProfileSelector
Grid of avatars for login.
*   **Props:**
    *   `profiles`: `Profile[]`
    *   `onSelect`: `(profileId: string) => void`
    *   `onAdd`: `() => void`

### 3.2 SkillRadar
Wrapper around the charting library for the progress dashboard.
*   **Props:**
    *   `data`: `SkillMetric[]`
    *   `width`: `number`
    *   `height`: `number`

### 3.3 AdultGateModal
The security challenge for protected areas.
*   **Props:**
    *   `isOpen`: `boolean`
    *   `onSuccess`: `() => void`
    *   `onCancel`: `() => void`

### 3.4 TopicList
Grid of available topics with lock states.
*   **Props:**
    *   `topics`: `Topic[]`
    *   `entitlements`: `EntitlementMap`
    *   `onSelect`: `(topicId: string) => void`

---

## 4. Layout Components (`src/components/layout`)

### 4.1 AppShell
The root layout component handling PWA status, offline banners, and global toasts.

### 4.2 NavBar
Responsive navigation bar.
*   **Props:**
    *   `mode`: `'child' | 'adult'`
    *   `activeRoute`: `string`

### 4.3 OfflineBanner
Sticky banner that appears when `navigator.onLine` is false.

