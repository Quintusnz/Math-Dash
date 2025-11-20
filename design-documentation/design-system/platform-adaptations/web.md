---
title: Web Platform Guidelines
description: Design guidelines for Math Dash as a responsive Web Application
feature: Platform Adaptations
last-updated: 2025-11-19
version: 1.1.0
related-files: 
  - ../components/navigation.md
dependencies: []
status: approved
---

# Web Platform Guidelines

## Overview
Math Dash is a responsive Web Application (PWA) designed to run on a wide range of devices, from mobile phones to desktop computers. It serves as the sole platform for the product.

## Responsive Layout

### Breakpoints
- **Mobile**: < 768px (Single column, hamburger menu or bottom bar).
- **Tablet**: 768px - 1024px (Two column, simplified header).
- **Desktop**: > 1024px (Centered content, full header, max-width containers).

### Input Methods
- **Hover**: Hover states are critical on desktop but non-existent on touch. Ensure all interactive elements have visual affordances without hover.
- **Focus**: Visible focus rings are mandatory for keyboard navigation (Tab key).

## Browser Features

### PWA (Progressive Web App)
- **Manifest**: Provide `manifest.json` for "Add to Home Screen".
- **Service Worker**: Cache assets for offline play (critical requirement).
- **Display Mode**: `standalone` or `fullscreen` to remove browser chrome during gameplay.

### Performance
- **Font Loading**: Use `font-display: swap` to prevent invisible text.
- **Image Formats**: Use WebP/AVIF with PNG fallbacks.

## Navigation
- **Browser Back**: Handle History API correctly so the browser Back button works as expected (doesn't exit the app unexpectedly).
- **Deep Linking**: Ensure URLs reflect the current state (e.g., `/play/topic/multiplication`) for sharing.

## Accessibility (Web Specific)
- **Title**: Update `document.title` on route change.
- **HTML Semantics**: Use proper `<button>`, `<a>`, `<input>` tags.
- **Shortcuts**: Consider keyboard shortcuts for gameplay (e.g., Number keys 1-4 for answers).
