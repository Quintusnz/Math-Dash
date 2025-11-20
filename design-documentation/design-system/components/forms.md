---
title: Forms & Inputs
description: Specifications for input fields, checkboxes, radios, and form layouts
feature: Design System
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../tokens/colors.md
  - ../tokens/typography.md
  - ../tokens/spacing.md
dependencies: []
status: approved
---

# Forms & Inputs

## Overview
Forms in Math Dash are primarily used for Profile Creation, Settings, and Login (Adults). They should be friendly, forgiving, and easy to tap.

## Components

### 1. Text Input
**Usage**: Name entry, search, codes.
**Visuals**:
- **Height**: 48px (Medium)
- **Background**: `color-white`
- **Border**: `2px solid color-neutral-300`
- **Radius**: `radius-md` (8px)
- **Text**: `text-body`
- **Placeholder**: `color-neutral-400`

**States**:
- **Focus**: Border `color-primary`, `ring-4` opacity 20%
- **Error**: Border `color-error`, Icon right, Helper text red
- **Success**: Border `color-success`, Icon right (Checkmark)
- **Disabled**: Background `color-neutral-100`, Border `color-neutral-200`

### 2. Checkbox
**Usage**: Settings toggles, multi-select.
**Visuals**:
- **Size**: 24x24px
- **Border**: `2px solid color-neutral-400`
- **Radius**: `radius-sm` (4px)
- **Checked**: Background `color-primary`, White Check icon

### 3. Radio Button
**Usage**: Single select options (e.g., Difficulty level).
**Visuals**:
- **Size**: 24x24px
- **Border**: `2px solid color-neutral-400`
- **Radius**: `radius-full`
- **Checked**: Border `color-primary`, Inner dot `color-primary`

### 4. Toggle Switch
**Usage**: On/Off settings (e.g., Sound, Music).
**Visuals**:
- **Size**: 50px Width x 28px Height
- **Track**: `color-neutral-300` (Off) / `color-success` (On)
- **Thumb**: White circle, shadow, slides left/right

## Layout & Spacing

- **Labels**: Placed above input (`text-label`, Bold). Gap `space-xs`.
- **Helper Text**: Placed below input (`text-caption`). Gap `space-xs`.
- **Field Groups**: Vertical spacing `space-lg` between distinct fields.
- **Validation**: Inline validation preferred. Error messages appear immediately below the field.

## Interaction Guidelines

- **Auto-focus**: Focus the first field when a form modal opens.
- **Keyboard**: Enter key should submit the form or move to next field.
- **Input Types**: Use correct HTML types (`email`, `number`, `tel`) to trigger appropriate mobile keyboards.

## Accessibility

- **Labels**: All inputs must have a visible `<label>` linked via `for/id`.
- **Error Association**: Error messages linked via `aria-describedby`.
- **Required Fields**: Mark visually (*) and semantically (`required`).
- **Touch Targets**: Checkboxes and Radios should have a 44x44px hit area (using padding/pseudo-elements).

## Example Structure

```html
<div class="form-group">
  <label for="username">Display Name</label>
  <input type="text" id="username" aria-describedby="username-help" />
  <span id="username-help" class="helper-text">This is how you'll appear on the leaderboard.</span>
</div>
```
