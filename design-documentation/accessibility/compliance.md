---
title: WCAG Compliance Statement
description: Math Dash compliance status against WCAG 2.1 AA standards
feature: Accessibility
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ./guidelines.md
dependencies: []
status: approved
---

# WCAG Compliance Statement

## Target Standard
Math Dash targets **WCAG 2.1 Level AA** compliance.

## Compliance Matrix

| Guideline | Status | Implementation Notes |
|-----------|--------|----------------------|
| **1.1.1 Non-text Content** | Pass | All icons and avatars have alt text. |
| **1.3.1 Info and Relationships** | Pass | Semantic HTML (headings, lists, nav) used throughout. |
| **1.4.1 Use of Color** | Pass | Color is never the sole conveyor of information (shapes/icons used). |
| **1.4.3 Contrast (Minimum)** | Pass | Text meets 4.5:1. Large text meets 3:1. |
| **2.1.1 Keyboard** | Pass | Full keyboard support implemented. |
| **2.1.2 No Keyboard Trap** | Pass | Modals manage focus correctly. |
| **2.2.1 Timing Adjustable** | Partial | *Exception*: "Timed Mode" is time-dependent by design (Game Exception). "Practice Mode" offers untimed alternative. |
| **2.3.1 Three Flashes** | Pass | No content flashes > 3 times/sec. |
| **2.4.4 Link Purpose** | Pass | Links have descriptive text or aria-labels. |
| **2.4.7 Focus Visible** | Pass | Custom high-contrast focus ring implemented. |
| **2.5.5 Target Size** | Pass | Touch targets are min 44x44px. |
| **3.1.1 Language of Page** | Pass | `lang` attribute set dynamically. |

## Known Issues & Roadmap
1.  **Complex Math Notation**: Screen reader pronunciation of complex equations (fractions) is currently basic. *Target fix: Q2 2026*.
2.  **Drag and Drop**: Not yet fully keyboard accessible. *Mitigation: Tap-to-move alternative provided.*

## Feedback Mechanism
Users can report accessibility barriers via `accessibility@mathdash.app` or the "Feedback" form in the Grown-ups area.
