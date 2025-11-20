---
title: Navigation
description: Specifications for navigation bars, menus, and breadcrumbs
feature: Design System
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../tokens/colors.md
  - ../tokens/spacing.md
dependencies: []
status: approved
---

# Navigation

## Overview
Navigation in Math Dash must be extremely simple. Children should never feel lost. We use a flat hierarchy with a persistent "Home" anchor.

## Components

### 1. Top Bar (Global)
**Usage**: Present on all screens except gameplay.
**Structure**:
- **Left**: Back Button (if deep) or Logo (if root).
- **Center**: Page Title (optional).
- **Right**: Profile Avatar / Settings Gear.
**Visuals**:
- **Height**: 64px (Mobile), 80px (Tablet/Desktop).
- **Background**: Transparent or `color-surface-base`.
- **Elevation**: None (flat) or `shadow-sm` on scroll.

### 2. Bottom Tab Bar (Mobile Only - Optional)
*Note: Math Dash MVP may not need this if the hierarchy is shallow. If used:*
**Usage**: Quick switching between major sections (Play, Topics, Progress).
**Visuals**:
- **Height**: 60px + Safe Area.
- **Background**: `color-white`.
- **Items**: Icon + Label.
- **Active State**: Icon `color-primary`, Label `color-primary`.
- **Inactive State**: `color-neutral-500`.

### 3. Card Grid Navigation
**Usage**: The primary way children navigate content (Topics, Modes).
**Structure**: Large tappable cards arranged in a grid.
**Interaction**: Single tap to enter.

### 4. Breadcrumbs
**Usage**: Deep hierarchies (e.g., Topic > Level > Lesson).
**Visuals**: `Home > Multiplication > 2x Table`.
**Style**: `text-caption`, clickable links.

## Gameplay Navigation

### 1. Pause / Exit
**Usage**: Top-left or Top-right corner during play.
**Icon**: Pause symbol (||) or "X".
**Behavior**: Triggers a modal (Resume / Quit).

### 2. Progress Stepper
**Usage**: Shows progress through a set of questions.
**Visuals**: Horizontal bar or dots.

## Interaction Guidelines

- **Back Behavior**: Browser Back button must be supported via History API.
- **Transitions**:
  - **Forward**: Slide in from Right.
  - **Backward**: Slide out to Right.
  - **Modal**: Slide up from Bottom / Fade in.

## Accessibility

- **Skip Links**: "Skip to main content" for keyboard users.
- **Landmarks**: Use `<nav>`, `<main>`, `<header>` tags.
- **Focus Order**: Logical flow from top-left to bottom-right.
- **Touch Targets**: All nav icons min 44x44px.
