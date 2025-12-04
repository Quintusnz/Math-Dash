# Math Dash – Business Model & Pricing (Draft)

## 1. Product & Market Positioning

- **Core Product**: Browser-based math fluency game for children 6–11, focused on math facts (addition/subtraction facts including number-bond style make-10/20, multiplication facts/times tables, division facts, doubles/halves, square numbers) with adaptive practice, progress dashboards, and basic classroom tools.
- **Target Segments**:
  - **Home**: Parents/caregivers wanting low-friction, effective daily practice.
  - **Schools**: Primary teachers needing warm-ups and tracking for small classes or full cohorts.
- **Value Proposition**:
  - Low-cost, one-time payment unlocks all core features.
  - Optional AI subscription for power users (home and teacher) that funds ongoing AI and infra costs.

---

## 2. Pricing Structure Overview

- **Core App (Non-AI Features)**: One-time purchase (no recurring fees) for all standard topics, modes, and basic teacher tools.
- **AI Add-On (Future)**: Optional, **credit-based model** where users purchase packs of AI "credits" that can be spent on discrete AI actions (e.g., analysing performance and generating tailored plans), instead of a recurring subscription.

This supports a **low-price / high-volume** strategy for the core business while keeping AI usage economically sustainable on a **per-use, pay-as-you-go** basis.

---

## 3. Core One-Time Pricing (Non-AI)

### 3.1 Home (Family) License

- **Reference Price – Tier 1 Markets** (US/UK/EU/AU/NZ):
  - **USD $6.99** (United States)
  - **GBP £5.99** (United Kingdom)
  - **EUR €6.99** (Eurozone)
  - **AUD A$10.99** (Australia)
  - **NZD NZ$11.99** (New Zealand)
- **Scope**:
  - One-time payment.
  - Unlocks all standard non-AI features: all tables (2×–12×) and their division counterparts, Make 10/20/50/100 number-bond style modes and missing-number facts, extended doubles/halves, adaptive mode, Dash Duel, and basic progress dashboards.
  - Covers all child profiles in a household on all devices associated with the same store account/email.
- **Free Tier**:
  - Always-available free starter content:
    - Times tables: 2×, 3×, 4×.
    - Division: inverse of 2×, 3×, 4× tables.
    - Addition & Subtraction: Make 10 (Number Bonds) and simple missing-number facts to 10.
    - Doubles/halves: simple ranges up to ~10.
  - Purpose: meaningful free experience + natural upsell path when users want higher tables and more content.

- **Regionalisation (Later Phase)**:
  - Tier 2 markets: ~50–60% of Tier 1 price (e.g., USD-equivalent $3.99–$4.49).
  - Tier 3 markets: ~25–35% of Tier 1 price (e.g., USD-equivalent $1.99–$2.49).
  - Implementation: rely on app store country tiers and/or platform-level price localisation once demand is validated.

### 3.2 Teacher / Small-School License

- **Reference Price – Tier 1 Markets** (US/UK/EU/AU/NZ):
  - **USD $19.99** (United States)
  - **GBP £17.99** (United Kingdom)
  - **EUR €19.99** (Eurozone)
  - **AUD A$29.99** (Australia)
  - **NZD NZ$32.99** (New Zealand)
- **Scope**:
  - One-time payment per teacher.
  - Unlocks teacher-specific features:
    - Class codes.
    - Class dashboards with per-pupil progress summaries.
    - Ability to manage a limited number of classes (e.g., 2–3 classes, ~60–90 pupils total).
  - Designed for individual teachers and small schools.

- **Future Expansion**:
  - Volume or site licenses for larger schools/multi-academy trusts.
  - Bulk purchase discounts and school invoicing once demand justifies complexity.

---

## 4. AI Add-On – Credit Packs (Future)

### 4.1 Home AI Credit Packs

- **Concept**:
  - Families purchase **packs of AI credits** (e.g., 5, 10, 25 credits) that can be used over time.
  - Each credit represents one AI-powered action such as: analysing a child’s recent performance and generating a tailored practice plan, or providing a deeper diagnostic review.
- **Indicative Pricing (to be validated)**:
  - Small pack (e.g., 5 credits): low one-time price, aligned with the "no-brainer" philosophy.
  - Larger packs (e.g., 10, 25 credits): better per-credit value but still one-time purchases.
- **Scope**:
  - Layered on top of the one-time core purchase (core app must remain fully useful without AI).
  - Credits can be consumed across all child profiles under one home license.
- **Example Features Backed by Credits**:
  - AI-generated practice plans based on recent performance.
  - "Explain my mistake" style analyses summarised into actionable next steps.

### 4.2 Teacher AI Credit Packs

- **Concept**:
  - Teachers purchase **class-oriented AI credit packs** that can be spent on higher-impact actions.
  - Each credit might correspond to analysing an entire class’s data or generating a set of differentiated group plans.
- **Indicative Pricing (to be validated)**:
  - Smaller packs for individual teachers (e.g., a few class analyses) at low one-time prices.
  - Larger packs for heavier users or schools at proportionally better per-credit rates.
- **Scope**:
  - Add-on to the teacher’s core license.
  - Credits can be used across all classes managed by that teacher.
- **Example Features Backed by Credits**:
  - Class-level weakness mapping and topic recommendations.
  - Risk flags for pupils likely to fall behind, with suggested interventions.
  - Suggested groupings for differentiated practice units.

### 4.3 Rationale

- AI workloads (tokens, inference) carry ongoing variable costs.
- A **credit-based model** keeps the core app as a simple one-time purchase while letting AI usage (and revenue) scale **per analysis**, without the friction of subscriptions.

---

## 5. Licensing Model & Entitlements

- **Home License**:
  - Entitlement tied to platform account (App Store, Play Store, or email-based web account).
  - All devices signed into that account share access to the purchased core license.
  - Unlimited child profiles within reasonable usage.

- **Teacher / School License**:
  - Entitlement tied to a teacher account.
  - Teacher can create and manage a fixed number of classes and pupils.
  - Additional teacher accounts require their own license (or a future site license).

- **AI Subscription Entitlements**:
  - Home AI: tied to the home account; applies to all profiles under that account.
  - Teacher AI: tied to the teacher account; applies to all classes they manage.

---

## 6. Launch & Promotion Strategy

- **Launch Discount**:
  - Consider 20–30% discount on the core one-time price for the first 3–6 months to reduce friction and encourage early adoption.

- **Trial Mechanics**:
  - Provide a **small number of free AI credits** (e.g., 1–3 analyses) to early adopters so they can experience AI-powered value before choosing to buy a credit pack.

- **Bundle Ideas**:
  - Home "Premium + AI Credits" bundle (core app + small credit pack) at a slight discount vs buying separately.
  - Teacher bundle including core license + an initial class analysis credit pack at a simplified price point.

---

## 7. Alignment with Product & Tech Constraints

- Core feature set and infra must be designed to:
  - Deliver real value in the free tier, and strong value in the one-time paid tier, **without requiring AI**.
  - Keep hosting and compute costs low enough that a one-time fee (e.g., ~$7.99 home, ~$19.99 teacher) is sustainable.
  - Isolate AI-heavy workloads behind **discrete, paid credit-pack usage** so they do not erode margins on the one-time license.

- This document is a starting point; prices and tiers should be validated via:
  - Competitor benchmarking.
  - Small-scale tests (e.g., A/B price points where platform policies allow).
  - Direct feedback from parents and teachers in target markets.
