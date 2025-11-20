---
title: Spacing System
description: Comprehensive spacing scale and layout grid system for Math Dash
feature: Design System
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../overview.md
  - ./typography.md
dependencies: []
status: approved
---

# Spacing & Layout System

## Overview
Math Dash uses an 8px base unit system to ensure consistency, rhythm, and alignment across all screens. This system applies to margins, padding, gaps, and layout grids. The 8px grid is divisible by 2 and 4, offering flexibility for micro-interactions while maintaining structure.

## Base Unit
**Base**: `8px` (0.5rem)

## Spacing Scale

| Token | Value (rem) | Value (px) | Usage Example |
|-------|-------------|------------|---------------|
| `space-2xs` | 0.125rem | 2px | Micro adjustments, border offsets |
| `space-xs` | 0.25rem | 4px | Icon-text gap, tight grouping |
| `space-sm` | 0.5rem | 8px | Component internal padding, related items |
| `space-md` | 1rem | 16px | Standard padding, card gaps, form spacing |
| `space-lg` | 1.5rem | 24px | Section separation, modal padding |
| `space-xl` | 2rem | 32px | Major section breaks, container margins |
| `space-2xl` | 3rem | 48px | Hero section padding, large whitespace |
| `space-3xl` | 4rem | 64px | Page top/bottom padding (Desktop) |
| `space-4xl` | 6rem | 96px | Landing page section gaps |

## Layout Grid

### Mobile (Portrait)
- **Breakpoint**: < 768px
- **Columns**: 4
- **Margin**: 16px (`space-md`)
- **Gutter**: 16px (`space-md`)

### Tablet (Portrait/Landscape)
- **Breakpoint**: 768px - 1023px
- **Columns**: 8
- **Margin**: 32px (`space-xl`)
- **Gutter**: 24px (`space-lg`)

### Desktop
- **Breakpoint**: ≥ 1024px
- **Columns**: 12
- **Margin**: Auto (Centered Container)
- **Max-Width**: 1200px
- **Gutter**: 32px (`space-xl`)

## Container Sizes

| Token | Max-Width | Usage |
|-------|-----------|-------|
| `container-sm` | 640px | Forms, Text-heavy pages, Modals |
| `container-md` | 768px | Tablet views, Dashboard widgets |
| `container-lg` | 1024px | Standard Desktop Layout |
| `container-xl` | 1280px | Wide Desktop, Analytics Dashboards |
| `container-fluid` | 100% | Full-width backgrounds, Maps |

## Z-Index Scale

To manage stacking contexts consistently:

| Token | Value | Usage |
|-------|-------|-------|
| `z-negative` | -1 | Background decorations |
| `z-base` | 0 | Default content |
| `z-elevated` | 10 | Hover states, elevated cards |
| `z-sticky` | 100 | Sticky headers, floating actions |
| `z-dropdown` | 200 | Dropdown menus, tooltips |
| `z-modal` | 300 | Modals, dialogs, overlays |
| `z-toast` | 400 | Notifications, toasts |
| `z-max` | 9999 | Critical errors, loading screens |

## Best Practices

1.  **Consistency**: Always use the defined tokens. Avoid magic numbers (e.g., `margin: 13px`).
2.  **Rhythm**: Use `space-md` (16px) as the default rhythm for vertical stacking.
3.  **Whitespace**: Don't be afraid of whitespace. Use `space-xl` and `space-2xl` to give content breathing room, especially for younger audiences to reduce cognitive load.
4.  **Touch Targets**: Ensure all interactive elements have at least `space-2xl` (48px) visual or hit-area size on mobile.

## Implementation Notes

- Use CSS Custom Properties (Variables) for all spacing tokens.
- Use `gap` property for Flexbox and Grid layouts instead of margins where possible.
- Implement a wrapper component for the Grid system to enforce consistency.
