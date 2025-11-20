---
title: Typography System
description: Complete typography specifications for Math Dash including font stack, scale, and usage guidelines
feature: Design System
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../overview.md
  - ./colors.md
dependencies: []
status: approved
---

# Typography System

## Overview
The Math Dash typography system is designed to be highly legible, playful, and accessible for children aged 6-11 while maintaining clarity for parents and teachers. We use a rounded sans-serif for headings to convey friendliness and a clean sans-serif for body text to ensure readability.

## Font Stack

### Primary (Headings & UI)
**Font Family**: `Nunito`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Helvetica Neue`, `sans-serif`
**Usage**: All headings, buttons, navigation, and primary UI elements.
**Characteristics**: Rounded terminals, open counters, high x-height.

### Secondary (Body & Long Form)
**Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
**Usage**: Body text, instructions, settings, and dense information.
**Characteristics**: Neutral, highly legible at small sizes, distinct numerals.

### Monospace (Data & Code)
**Font Family**: `JetBrains Mono`, `Consolas`, `Monaco`, `monospace`
**Usage**: API keys, technical error logs (in adult view), specific number alignment scenarios.

## Type Scale

The type scale is based on a Major Third (1.25) ratio to ensure clear hierarchy.

| Token | Role | Size (rem/px) | Line Height | Weight | Letter Spacing | Usage |
|-------|------|---------------|-------------|--------|----------------|-------|
| `text-display` | Hero Titles | 3.05rem / 48.8px | 1.1 | 800 (ExBold) | -0.02em | Game Over screens, Hero banners |
| `text-h1` | Page Titles | 2.44rem / 39px | 1.2 | 700 (Bold) | -0.01em | Main screen headers |
| `text-h2` | Section Headers | 1.95rem / 31.25px | 1.25 | 700 (Bold) | 0 | Modal titles, Card groups |
| `text-h3` | Subsection | 1.56rem / 25px | 1.3 | 600 (SemiBold) | 0 | Card titles, Feature headers |
| `text-h4` | Minor Headers | 1.25rem / 20px | 1.4 | 600 (SemiBold) | 0.01em | List items, Form groups |
| `text-body-lg` | Lead Text | 1.125rem / 18px | 1.5 | 400 (Reg) | 0 | Intro text, Important instructions |
| `text-body` | Base Text | 1rem / 16px | 1.5 | 400 (Reg) | 0 | Standard paragraphs, Form inputs |
| `text-body-sm` | Secondary | 0.875rem / 14px | 1.5 | 400 (Reg) | 0.01em | Helper text, Metadata |
| `text-caption` | Caption | 0.75rem / 12px | 1.4 | 500 (Med) | 0.02em | Labels, Timestamps, Badges |
| `text-button` | Button Label | 1rem / 16px | 1.0 | 700 (Bold) | 0.02em | Buttons (Uppercase optional) |

## Font Weights

- **Regular (400)**: Body text, secondary information
- **Medium (500)**: Captions, emphasized body text
- **SemiBold (600)**: Subheadings, strong emphasis
- **Bold (700)**: Headings, buttons, primary actions
- **ExtraBold (800)**: Display text, hero numbers

## Responsive Scaling

Typography automatically scales across devices to maintain readability.

### Mobile (< 768px)
- Base size: 16px
- Scale ratio: 1.2 (Minor Third)
- `text-display` reduces to 2.5rem (40px)

### Tablet (768px - 1024px)
- Base size: 16px
- Scale ratio: 1.25 (Major Third)

### Desktop (> 1024px)
- Base size: 16px (or 18px for large displays)
- Scale ratio: 1.25 (Major Third)

## Accessibility Guidelines

1.  **Contrast**: All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
2.  **Scaling**: Text must be resizable up to 200% without breaking layout.
3.  **Line Length**: Body text lines should not exceed 60-75 characters for optimal reading comfort.
4.  **Hierarchy**: Always use semantic heading tags (H1-H6) in code, matching the visual hierarchy.

## Implementation Notes

- Use `rem` units for font sizes to respect user browser settings.
- Use unitless line heights for better inheritance.
- Font files should be self-hosted or served via performant CDN with `font-display: swap`.
