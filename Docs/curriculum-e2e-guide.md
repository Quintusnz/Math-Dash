# Curriculum End-to-End Testing Guide

This document outlines how to run the Playwright suites that exercise the curriculum feature end-to-end, plus the manual checks needed to satisfy the remaining acceptance criteria.

## Automated E2E checks

### Running Playwright

1. Start the app locally: `npm run dev`.  
2. In another terminal run `npm run test:e2e`.  
3. Playwright launches the app in Desktop Chrome, Pixel 5, and iPad Pro 11 emulations.  
4. The suite covers:
   - Creating a new profile, selecting age band, setting country/year, and verifying the settings panel updates.  
   - Opening the progress tab, selecting a profile, showing the curriculum progress view, and clicking a recommendation to launch practice.  
   - Reloading the grown-ups dashboard in offline mode (Playwright’s `context.setOffline(true)`) to ensure the page still renders.

The tests assume a seeded demo profile (`Johnny`) plus the new profile created in the suite; they rely on the standard adult-focused dashboard layout (`/grown-ups`).

## Manual verification

Some acceptance criteria require manual observation:

- **Status transitions (behind → on-track → ahead).** Use Chrome DevTools Performance/Console while playing multiple sessions. Observe the curriculum card’s status badge update as accuracy/coverage improves.  
- **Profile migration flow, country/year popularity, status ↔ engagement correlations**, and the **offline PWA experience** are best confirmed via a dedicated Chrome DevTools session (record timeline, toggle offline via the Network tab, and inspect IndexedDB).  
- **Testing on multiple screen sizes** is captured via the Playwright project matrix, but you can also resize the browser manually and confirm the responsive layout doesn’t hide the curriculum cards or buttons.

Add any additional findings (e.g., device, browser version, network conditions) under this doc as new entries.
