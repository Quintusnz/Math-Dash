---
title: Modals & Dialogs
description: Specifications for overlays, alerts, and confirmation dialogs
feature: Design System
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../tokens/colors.md
  - ../tokens/spacing.md
  - ./buttons.md
dependencies: []
status: approved
---

# Modals & Dialogs

## Overview
Modals interrupt the user flow to demand attention or input. In Ready Steady Math, they are used for Pause menus, Game Over summaries, Settings, and "Grown-ups" gates.

## Variants

### 1. Alert Dialog (Small)
**Usage**: Confirmations ("Quit Game?"), Errors, Simple Info.
**Structure**:
- **Title**: Short, Bold.
- **Body**: Description of consequence.
- **Actions**: "Cancel" (Secondary) + "Confirm" (Primary/Destructive).
**Visuals**:
- **Width**: `container-sm` (max 400px).
- **Radius**: `radius-lg`.
- **Backdrop**: Black at 50% opacity.

### 2. Full Screen Modal
**Usage**: Settings, Profile Creation, "Grown-ups" Area.
**Structure**:
- **Header**: Title + Close Button (X).
- **Body**: Scrollable content.
- **Footer**: Sticky actions (Save/Cancel).
**Visuals**:
- **Mobile**: Covers 100% screen (slide up).
- **Desktop**: Centered large modal or slide-over panel.

### 3. Game Summary Modal
**Usage**: End of round stats.
**Structure**:
- **Header**: "Great Job!" / Stars.
- **Body**: Score, Time, Accuracy.
- **Actions**: "Replay", "Menu", "Next Level".
**Visuals**:
- **Style**: Celebratory, confetti, bright colors.

## Interaction Guidelines

- **Trigger**: Immediate appearance on action.
- **Dismissal**:
  - **Alerts**: Must choose an option.
  - **Info**: Click backdrop or "X" to close.
- **Animation**:
  - **Enter**: `scale-in` (95% -> 100%) + `fade-in`.
  - **Exit**: `fade-out`.

## Accessibility

- **Focus Trap**: Keyboard focus must be trapped within the modal while open.
- **Esc Key**: Should close the modal (unless it's a forced choice).
- **ARIA**: `role="dialog"` or `role="alertdialog"`. `aria-modal="true"`.
- **Backdrop**: `aria-hidden="true"` for content behind the modal.
