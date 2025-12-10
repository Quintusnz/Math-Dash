# Ready Steady Math – Business Model & Pricing Viability (Tier-1 Launch)

**Version:** 2.0  
**Last Updated:** November 2025  
**Status:** Active

> **Note:** Ready Steady Math was previously referred to as 'Math Dash' in earlier internal drafts.
>
> This report synthesises the existing Ready Steady Math documentation with current infrastructure and AI pricing to evaluate whether a one-time core purchase plus optional Ready Steady Math Coach subscription and AI credit packs is commercially viable for an initial launch in Tier-1 markets (US, UK, EU). All figures are indicative and meant for planning, not budgeting.

---

## Document Change Log

This section summarises the major changes and additions made in this version of the document.

### Changes & Additions (November 2025)

1. **Business Model Overview (Section 1)** – Updated
   - Clarified the three-tier monetisation model: Free tier → One-time Core unlock → Optional Ready Steady Math Coach subscription
   - Made explicit that Ready Steady Math is a one-time paid core game plus optional recurring AI subscription
   - Added AI credit packs as secondary option for subscription-averse users

2. **Pricing Assumptions (Section 3)** – Updated
   - Updated Home/Family Core unlock price from US$7.99 to **US$6.99** (one-time)
   - Confirmed Teacher Core unlock at **US$19.99** (one-time)
   - Added **Ready Steady Math Coach** subscription pricing: **US$2.49/month** or **US$23.99/year**
   - Marked AI credit packs as secondary option with potential future phase-out

3. **Ready Steady Math Coach Economics (Section 4)** – New Section
   - Added complete analysis of Coach subscription economics
   - Defined unit economics: US$28.40 net per subscriber-year
   - Defined attach rate scenarios: 10% (conservative), 20% (Base), 30% (stretch)
   - Updated infra/AI Opex assumption to US$7,000/year when Coach is active

4. **5-Year Projections (Section 7)** – Extended
   - Added explicit paying parent counts by year for Base scenario
   - Added Coach subscriber projections at different attach rates
   - Created subscription revenue tables showing 5-year impact
   - Updated 5-year net contribution summaries with Coach revenue integrated
   - Added Low and High scenario Coach impact summaries

5. **Break-Even Analysis (Section 8)** – Updated
   - Updated break-even commentary to show how Coach reduces customer acquisition requirements
   - Added analysis of recurring vs one-off revenue mix benefits

6. **Risk & Sensitivity Analysis (Section 5)** – Extended
   - Added subscription-specific risks: attach rate, churn, perception
   - Added mitigations for subscription risks
   - Added sensitivity commentary for different attach rate scenarios

7. **Conclusions & Recommendations (Section 9)** – Updated
   - Updated to reflect Coach subscription decision
   - Added strategic approach: short-term hybrid model, medium-term simplification option
   - Confirmed US$2.49/month pricing is competitive and sufficient

---

## 1. Product & Monetisation Context

### 1.1 Core Experience

**From the current specs:**

- **Core experience**
  - Browser-based math fluency game for children 6–11.
  - Local-first gameplay; question generation and logging are mostly client-side.
  - Optional cloud services for sync, analytics, payments, and AI.
- **Target customers**
  - Parents/home use (multi-child households).
  - Primary teachers/small schools.
- **Stack & infra (Docs/technical-architecture.md)**
  - Next.js on **Vercel** (App Router).
  - **Supabase** for Postgres, Auth, Storage, Edge Functions.
  - **Stripe** for payments (core unlock, Coach subscription, AI credits).
  - Segment-style analytics (events proxied via Next.js).
  - AI features via server-side calls to LLM APIs.

### 1.2 Monetisation Model Overview

Ready Steady Math operates a **one-time paid core game** with an **optional low-cost AI subscription** for parents. The model is designed to be simple, transparent, and family-friendly.

**Three-tier model:**

1. **Free Tier** – Try before you buy
   - Free starter topics and modes, offline-capable.
   - Basic progress tracking per profile.
   - Purpose: Allow families and teachers to experience core gameplay before purchase.

2. **One-time Core Unlock** – Full game access
   - Unlocks full topic set, adaptive practice, local multiplayer, and limited teacher tools.
   - **Home/Family:** US$6.99 one-time (per household, multiple children).
   - **Teacher:** US$19.99 one-time (per teacher account).
   - Game is fully usable without any ongoing subscription.

3. **Optional Ready Steady Math Coach Subscription** – AI-powered parent guidance
   - Low-cost subscription that turns gameplay data into clear insights and guided practice plans.
   - **Monthly:** US$2.49/month.
   - **Annual:** US$23.99/year (≈US$2/month, "2 months free" positioning).
   - Per household, not per child.
   - Requires Core unlock as prerequisite.

4. **Optional AI Credit Packs** – Secondary path for one-off reports
   - For subscription-averse parents who want occasional deep-dive AI reports.
   - Positioned as secondary option; Coach subscription is primary AI offering.
   - May be phased out in medium term if Coach adoption is strong and credits create pricing confusion.

**Key principle:** Ready Steady Math is fundamentally a **one-time paid core game** (not a subscription game), with an **optional recurring AI subscription** that adds value for parents who want ongoing guidance. Most revenue comes from one-time Core upgrades, with Coach subscriptions and AI credits as high-margin add-ons.

---

## 2. Cost Structure Overview

### 2.1 Infrastructure & Third-Party Services

Assuming a typical modern setup for a small SaaS/consumer app:

- **Vercel (Next.js hosting)**
  - Pro plan includes a team seat at **~$20/month** and bundles a reasonable amount of bandwidth, function execution time, and storage.
  - Additional usage is billed per GB / per million requests; for a relatively light, mostly client-side game, infra usage is modest compared to high-traffic media sites.
  - For early launch, expect **$0–$20/month** (Hobby or single Pro seat). At higher usage, budget **$50–$200/month**.

- **Supabase (Postgres, Auth, Storage, Edge Functions)**
  - Free tier suitable for prototype/small beta (≈0.5 GB DB, limited bandwidth).
  - Pro base fee commonly around **$25/month**, with usage-based overages for storage, bandwidth, Edge Functions, and MAUs.
  - For a small-to-medium launch with tens of thousands of sign-ups:
    - Base Pro fee: **~$25–$50/month**.
    - Overages (storage, bandwidth, Edge Functions): **$0–$150/month** depending on growth.
  - **Coach-specific overhead:** Additional storage for subscription state, practice plans, and coach reports adds modest incremental cost (~$10–20/month at scale).

- **Payments (Stripe)**
  - Card processing typically **~2.9% + $0.30 per transaction** in the US (similar in other Tier-1 markets).
  - For small ticket sizes ($6.99, $2.49), the fixed $0.30 component is significant.
  - For modelling, it's reasonable to assume **~5% blended fees** (card fees + occasional refunds + app store fees if you ever route traffic through native wrappers).
  - **Subscription billing:** Stripe handles recurring billing automatically; same fee structure applies.

- **Analytics & logging**
  - Segment-style tools often have a free/startup tier; paid plans can reach **$100–$300+/month** at higher event volumes.
  - At launch, you can stay on free tiers or low-cost tools; budget **$0–$100/month** until you're at serious scale.

- **Other recurring services**
  - Domains, transactional email, error monitoring, uptime, storage for assets, etc.
  - Realistic early-stage budget: **$50–$150/month**.

**Summary – purely technical/3rd-party Opex (excluding people):**

| Scale | Without Coach | With Coach Active |
|-------|---------------|-------------------|
| Pre-launch / small beta | $0–$50/month | $0–$50/month |
| Early commercial launch | ~$100–$250/month | ~$150–$350/month |
| Larger scale (tens of thousands MAUs) | ~$400–$1,000/month | ~$500–$1,200/month |

### 2.2 AI Compute Costs

Using current OpenAI API pricing (November 2025):

- Example low-cost model: **GPT-5 nano** (good for support bots and basic progress analysis).
  - Input: **$0.05 / 1M tokens**.
  - Output: **$0.40 / 1M tokens**.

**Rough costs for Coach features:**

- **Weekly practice plan generation (per child)**
  - Assume 1,500 input tokens (child metrics + instructions) and 800 output tokens (plan + explanations).
  - Cost per plan:
    - Input: 1,500 / 1,000,000 × $0.05 ≈ **$0.000075**.
    - Output: 800 / 1,000,000 × $0.40 ≈ **$0.00032**.
    - **Total ≈ $0.0004 per plan (0.04 cents)**.
  - Even with weekly updates for 1,000 subscribers: **~$1.60/month**.

- **Monthly coach report (per child)**
  - Assume 2,000 input tokens and 1,200 output tokens.
  - Cost per report: **≈$0.0006 (0.06 cents)**.
  - Monthly reports for 1,000 subscribers: **~$0.60/month**.

- **AI credit pack analysis (per "credit")**
  - Assume 1,000 input tokens and 500 output tokens.
  - **Total ≈ $0.00025 per analysis (0.025 cents)**.
  - A 50-credit pack has raw AI cost of **≈$0.0125**.

**Implication:** With modern small models, **AI compute is effectively negligible** compared to payments and hosting. Even heavy Coach usage (thousands of subscribers, weekly plans, monthly reports) adds only **$10–50/month** in AI costs. You can price Coach subscriptions and AI credits entirely around perceived value and behaviour, not cost.

### 2.3 Support & Operations

- **First-line support via AI bot**:
  - Very cheap to run (see above).
  - Realistically, many issues still require a human (billing issues, bugs, subscription questions).
- **Human support load (indicative)**
  - Consumer apps often see **2–5%** of paying customers generate at least one support interaction over a year.
  - **Coach subscribers may generate slightly more queries** ("Why does the plan recommend this?", "How do I read this report?").
  - With good UX and AI triage, you might see:
    - Low-scale: founders handle support ad-hoc.
    - Medium-scale (a few thousand paying customers): **~5–25 hours/month** of human support.
    - High-scale: part-time support contractor (0.2–0.5 FTE), which is **far more expensive than AI compute**.

For this report, **people costs (dev, design, support, marketing)** are treated separately from infra/AI costs. The key question is whether the **combined one-time + subscription model can generate enough margin** to eventually cover those human costs.

---

## 3. Revenue Model & Pricing Structure

### 3.1 Core One-Time Purchase

**Current pricing for Tier-1 countries:**

| Licence Type | Price (USD) | Price (GBP) | Price (EUR) |
|--------------|-------------|-------------|-------------|
| Home/Family | **$6.99** | £5.99 | €6.99 |
| Teacher | **$19.99** | £17.99 | €19.99 |

**Characteristics:**

- Very low friction; feels like a "premium game" price point.
- Attractive vs subscription competitors for price-sensitive parents and teachers.
- **Downside:** Revenue is front-loaded and tied to new customer acquisition. Existing users generate little or no recurring revenue unless they buy AI features.

**Net receipts after fees (~5% blended):**

- Home: **≈$6.64** per purchase.
- Teacher: **≈$19.00** per purchase.

**Notes:**

- US$6.99 is the base modelling assumption for all financial calculations in this document.
- We may later test US$7.99 once brand and product maturity increase, but all numeric projections here use US$6.99.
- Teacher/school licensing may be handled separately in future (volume discounts, site licences).

### 3.2 Ready Steady Math Coach – Parent Subscription

**Pricing:**

| Plan | Price | Effective Monthly | Annual Gross |
|------|-------|-------------------|--------------|
| Monthly | **$2.49/month** | $2.49 | $29.88 |
| Annual | **$23.99/year** | ~$2.00 | $23.99 |

- Positioned as "2 months free" for annual plan.
- Per household, not per child – a single subscription covers Coach features for all child profiles.

**Regional equivalents (Tier 1):**

- Monthly: GBP £1.99 / EUR €2.49
- Annual: GBP £19.99 / EUR €23.99

**Net receipts after fees (~5% blended):**

- Monthly: **≈$2.37/month** net.
- Annual: **≈$22.80/year** net.

**For financial modelling, we use:**

- **US$2.49/month** as the primary price point.
- Assume **mix of monthly and annual subscribers** averaging approximately **US$28.40 net per subscriber-year** (slightly below pure monthly due to annual discounts).

### 3.3 AI Credit Packs (Secondary Option)

**Current pricing:**

| Pack | Price | Contents | Net (after fees) |
|------|-------|----------|------------------|
| Parent "Insight Pack" | **$4.99** | ~50 analysis credits | ≈$4.75 |
| Teacher "Class Insight Pack" | **$14.99** | ~200 analysis credits | ≈$14.25 |

**What credits can be used for:**

- One-off detailed skill analysis reports.
- Term-end or holiday progress summaries.
- Deep-dive reports on specific skill areas.

**Important positioning:**

- Credit packs are a **secondary, optional path** for subscription-averse parents who want occasional deep-dive AI reports.
- **Coach subscription is the primary AI offering** and should be positioned prominently.
- Credits do not expire but are non-refundable.

**Medium-term consideration:**

- If Coach adoption is strong and AI credit packs see low, infrequent usage, we may phase out credit packs for new users.
- Existing credit purchases would be honoured indefinitely.
- Decision to be reviewed 12 months post-Coach launch based on:
  - Credit pack purchase volume vs Coach subscriptions.
  - Support burden from credit-related confusion.
  - Revenue contribution comparison.

---

## 4. Ready Steady Math Coach – Economics and Role in the Model

### 4.1 Concept

Ready Steady Math Coach is a **low-cost parent subscription** that:

- Turns gameplay data into clear insights about each child's strengths and weaknesses.
- Provides a simple weekly practice plan written in plain language.
- Delivers monthly/termly progress summaries and coach reports.
- Gives parents confidence to support their child's math development without being experts.

**Key positioning:**

- This is a **lightweight AI coaching/analytics layer** on top of the existing fluency game.
- It is **not** a full tutoring service, curriculum, or diagnostic tool.
- Coach requires Core unlock as a prerequisite – it's an add-on for engaged parents, not a standalone product.

### 4.2 Unit Economics

**Core assumptions:**

| Item | Value |
|------|-------|
| Subscription price | US$2.49/month |
| Annual equivalent (gross) | US$29.88/year |
| Payment fees (Stripe, ~5%) | ~US$1.50/year |
| **Net per subscriber-year** | **≈US$28.40** |
| AI compute cost (per subscriber-year) | <US$0.50 |
| **Gross margin** | **>98%** |

**Explanation:**

- At US$2.49/month, a subscriber paying monthly for 12 months generates US$29.88 gross.
- After ~5% payment fees, net is approximately US$28.40.
- AI compute costs (weekly plans, monthly reports, ad-hoc analyses) are negligible – well under US$0.50 per subscriber per year even with generous usage.
- This means **nearly all subscription revenue is margin**.

**Infrastructure overhead:**

- With Coach active at meaningful scale (hundreds to thousands of subscribers), we assume:
  - Modest increase in Supabase storage/bandwidth for subscription state and coach data.
  - Additional AI API calls (still negligible cost).
  - Slightly more complex codebase and support overhead.
- **For modelling purposes:** When Coach is active, we increase annual infra/AI/tools Opex from US$5,000 to **US$7,000** in Base scenarios to stay conservative.

### 4.3 Attach Rate Assumptions

**Definition:** Attach rate is the percentage of paying parents (Core unlock purchasers) who also subscribe to Ready Steady Math Coach.

**Modelled scenarios:**

| Scenario | Attach Rate | Rationale |
|----------|-------------|-----------|
| Conservative | **10%** | Low adoption; many parents see no need for extra guidance |
| Base | **20%** | Moderate adoption; engaged parents value clear recommendations |
| Stretch | **30%** | Strong adoption; compelling value proposition and good onboarding |

**Important notes:**

- Attach rates apply only to **paying parents** (those who purchased Core unlock), not to all sign-ups.
- Attach rates may improve over time as:
  - Coach features mature and demonstrate value.
  - Onboarding and in-product messaging improve.
  - Word-of-mouth builds among parents.
- For Year 1, we use the stated attach rates. For Years 2–5, we model gradual improvement (e.g., +2–5 percentage points per year in Base scenario).

### 4.4 Coach Revenue Projections (Base Scenario)

**Base scenario paying parent counts (from Year 1 modelling):**

| Year | New Sign-ups | Conversion Rate | New Paying Parents | Cumulative Paying Parents |
|------|--------------|-----------------|--------------------|-----------------------------|
| Year 1 | 50,000 | 5% | 2,500 | 2,500 |
| Year 2 | 62,500 | 5.2% | 3,250 | 5,750 |
| Year 3 | 78,125 | 5.4% | 4,219 | 9,969 |
| Year 4 | 97,656 | 5.6% | 5,469 | 15,438 |
| Year 5 | 122,070 | 5.8% | 7,080 | 22,518 |

> Note: Sign-ups grow ~25% per year. Conversion improves slightly as product/UX matures. Cumulative assumes some churn/aging out, but new cohorts replace them.

**Coach subscribers at different attach rates:**

| Year | Paying Parents (New) | 10% Attach | 20% Attach | 30% Attach |
|------|---------------------|------------|------------|------------|
| Year 1 | 2,500 | 250 | 500 | 750 |
| Year 2 | 3,250 | 325 | 650 | 975 |
| Year 3 | 4,219 | 422 | 844 | 1,266 |
| Year 4 | 5,469 | 547 | 1,094 | 1,641 |
| Year 5 | 7,080 | 708 | 1,416 | 2,124 |
| **5-Year Total** | **22,518** | **2,252** | **4,504** | **6,756** |

**Net subscription revenue (at US$28.40 per subscriber-year):**

| Year | 10% Attach | 20% Attach | 30% Attach |
|------|------------|------------|------------|
| Year 1 | $7,100 | $14,200 | $21,300 |
| Year 2 | $9,230 | $18,460 | $27,690 |
| Year 3 | $11,985 | $23,970 | $35,954 |
| Year 4 | $15,535 | $31,070 | $46,605 |
| Year 5 | $20,107 | $40,214 | $60,322 |
| **5-Year Total** | **$63,957** | **$127,914** | **$191,871** |

**Interpretation:**

- At **10% attach** (conservative), Coach adds approximately **US$64,000** in net revenue over 5 years.
- At **20% attach** (Base), Coach adds approximately **US$128,000** over 5 years.
- At **30% attach** (stretch), Coach adds approximately **US$192,000** over 5 years.

---

## 5. Sensitivities & Risks

### 5.1 Conversion Rate Sensitivity

Your viability is very sensitive to:

- **Parent free-to-paid conversion**:
  - Moving from 2% → 5% roughly **2.5×** Year-1 revenue at the same top-of-funnel.
  - Moving from 5% → 8% adds another **~60%**.
- **Teacher conversion & volume**:
  - Teachers pay more and can bring many students; a relatively small number of teacher licences can have outsized impact.
  - However, school sales cycles are slower and require more support.

### 5.2 One-Time vs Recurring Revenue

- **One-time core licences:**
  - Great for user sentiment ("buy once, own it").
  - But **revenue flattens** when new sign-ups flatten. You must constantly acquire new buyers.
- **Coach subscription:**
  - Provides **predictable recurring revenue** that smooths cash flow.
  - Allows you to justify ongoing investment in AI features and support.
  - Reduces dependence on constant new customer acquisition.
- **AI credits:**
  - Technically renewable and high-margin.
  - In practice, parents may buy packs only occasionally; less predictable than subscriptions.

### 5.3 Subscription-Specific Risks

**Behavioural risk: Low attach rate**

- Risk: Fewer parents subscribe than expected (e.g., single-digit attach rate).
- Impact: Coach revenue disappoints; model reverts toward pure one-time purchase economics.
- Likelihood: Medium – depends heavily on value demonstration and onboarding.

**Churn risk: Subscribe-and-cancel behaviour**

- Risk: Parents subscribe for one month to get a report, then cancel immediately.
- Impact: Effective revenue per subscriber is much lower than annual projections.
- Likelihood: Medium – common pattern for low-ticket subscriptions.
- Mitigation: Design Coach for **ongoing value** (weekly plans, progress tracking) not just one-off reports.

**Perception risk: Subscription aversion**

- Risk: Some parents actively dislike subscriptions and may avoid Ready Steady Math because of Coach.
- Impact: Could reduce Core unlock conversion if messaging is unclear.
- Likelihood: Low – Coach is clearly optional and Core unlock is prominently one-time.
- Mitigation: Emphasise "buy once, play forever" for Core; position Coach as optional "extra guidance."

### 5.4 Mitigations for Subscription Risks

1. **Keep AI credit packs as an alternative** (at least initially) for subscription-averse users who want occasional AI reports.

2. **Design strong in-product value messaging and onboarding for Coach:**
   - Show clear preview of what Coach provides before purchase.
   - Emphasise concrete value: "Know exactly what to practice next week."
   - Use low price point as selling point: "Less than a coffee per month."

3. **Build ongoing engagement value into Coach:**
   - Weekly practice plans (not just monthly reports).
   - Progress notifications and celebrations.
   - Term-based goals and seasonal content.

4. **Monitor churn closely:**
   - Track subscription duration and cancellation reasons.
   - If churn is high, consider:
     - Annual-only pricing (with higher perceived commitment).
     - Bundling Coach with Core at slightly higher price.

### 5.5 Sensitivity Commentary

**How the business looks under different attach rates:**

| Attach Rate | 5-Year Coach Revenue | Impact on Net Contribution |
|-------------|---------------------|----------------------------|
| 5% (very low) | ~$32,000 | Modest uplift; model relies on Core revenue |
| 10% (conservative) | ~$64,000 | Meaningful addition; covers additional Opex |
| 20% (Base) | ~$128,000 | Significant uplift; strengthens sustainability |
| 30%+ (stretch) | ~$192,000+ | Strong recurring base; supports team growth |

**Key insight:** The business is still **viable without a massive attach rate**. Even at very low adoption (5–10%), Coach covers its incremental costs and adds some margin. At Base attach (20%) or better, Coach **significantly strengthens** the financial picture and makes the model more sustainable.

### 5.6 Channel & Platform Risks

- If you later add **App Store / Play Store** distribution:
  - Store fees (15–30%) materially reduce net revenue unless you price higher on mobile.
  - This could push you toward **higher ticket prices** or **subscription bundles** for app-store users.
  - Coach subscription may need to be priced at US$2.99+ on app stores to maintain similar net margin.

### 5.7 Support and Product Complexity

- As you add Coach features, teacher tools, and sync, **support complexity increases**:
  - More edge cases; more "why did the Coach recommend this?" questions.
  - Regulations for children's data (GDPR-K, COPPA) may add compliance overhead.
- These are mostly **people and process costs**, not infra or AI compute costs, but they can erode margins if underestimated.

---

## 6. Year-One Scenario Modelling

The numbers below model **Year 1** after launch in Tier-1 markets, focusing on **new sign-ups and purchases in that year**.

### 6.1 Shared Modelling Assumptions

- Currency: **USD** for simplicity.
- Prices: As specified in Section 3.
- Stripe + other payment fees: **5%** blended on all purchases.
- All amounts are **approximate** and rounded.
- Sign-ups are split into:
  - **Households** (parents/caregivers).
  - **Teacher accounts** (single teacher/small school).
- Conversion rates are **lifetime conversions on Year-1 sign-ups** (not monthly churn/retention).
- Coach attach rates are the **share of paying parents** who subscribe to Coach.

> Note: All scenarios assume most buyers come through organic/word-of-mouth and low-cost channels. Paid acquisition (ads, affiliates) would reduce effective margins depending on CAC; that is not explicitly modelled here.

### 6.2 Scenario Definitions

**Scenario A – Low-traction year**

- 10,000 household sign-ups; 1,000 teacher sign-ups.
- Parent conversion: **2%** → **200** paying parents.
- Teacher conversion: **3%** → **30** paying teachers.
- Coach attach: **10%** of paying parents.
- AI credit attach (for non-Coach parents): 5%.

**Scenario B – Base case**

- 50,000 household sign-ups; 3,000 teacher sign-ups.
- Parent conversion: **5%** → **2,500** paying parents.
- Teacher conversion: **6%** → **180** paying teachers.
- Coach attach: **20%** of paying parents.
- AI credit attach (for non-Coach parents): 10%.

**Scenario C – High-success year**

- 200,000 household sign-ups; 10,000 teacher sign-ups.
- Parent conversion: **8%** → **16,000** paying parents.
- Teacher conversion: **8%** → **800** paying teachers.
- Coach attach: **30%** of paying parents.
- AI credit attach (for non-Coach parents): 15%.

### 6.3 Revenue per Scenario (Year 1)

**Approximate Year-1 revenue (with Coach subscription):**

| Scenario | Paying Parents | Paying Teachers | Core Revenue (Home) | Core Revenue (Teacher) | Coach Subscription Revenue | AI Credit Revenue | **Gross Revenue** | Payment Fees (~5%) | **Net After Fees** |
|----------|----------------|-----------------|---------------------|------------------------|---------------------------|-------------------|-------------------|--------------------|--------------------|
| Low | 200 | 30 | $1,398 | $600 | $568 | $45 | **$2,611** | ~$130 | **~$2,480** |
| Base | 2,500 | 180 | $17,475 | $3,596 | $14,200 | $1,000 | **$36,271** | ~$1,815 | **~$34,455** |
| High | 16,000 | 800 | $111,840 | $15,992 | $136,320 | $5,990 | **$270,142** | ~$13,507 | **~$256,635** |

> Notes:
> - Core Revenue (Home) = Paying parents × $6.99
> - Coach Revenue = Coach subscribers × $28.40 (net annualised)
> - AI Credit Revenue = Non-Coach paying parents × credit attach rate × $4.99

### 6.4 Infra + AI Opex per Scenario (Year 1)

Based on the infra and AI cost analysis, with Coach active:

| Scenario | Indicative Annual Opex |
|----------|------------------------|
| Low | ~$2,500 |
| Base | ~$7,000 |
| High | ~$20,000 |

### 6.5 Approximate Net Contribution (Year 1, Before Salaries & Marketing)

| Scenario | Net After Fees | Est. Opex | **Net Contribution** |
|----------|----------------|-----------|----------------------|
| Low | ~$2,480 | ~$2,500 | **≈$0** (break-even) |
| Base | ~$34,455 | ~$7,000 | **≈$27,500** |
| High | ~$256,635 | ~$20,000 | **≈$236,600** |

**Interpretation:**

- At **low traction**, the model roughly breaks even on infra/tools. Still a side-project.
- At **Base case**, the addition of Coach subscription revenue increases Year-1 net contribution from ~$20k (without Coach) to **~$27.5k** (+37.5%).
- At **High success**, Coach subscription revenue significantly boosts the already strong model.

---

## 7. Five-Year Market Context & Projections

This section extends the analysis from a one-year snapshot to a **five-year view**, using high-level market assumptions and three growth scenarios (Low, Base, High).

### 7.1 Market Context & High-Level Assumptions

**Primary school population (Tier-1 focus)**

- **US (K-5 / 6–11 yrs)**: ≈25 million children.
- **UK (Primary)**: ≈5 million.
- **EU-5 (DE/FR/IT/ES/NL) primary**: ≈20–25 million.
- Rough total in core Tier-1 markets: **≈50–55 million primary-age children** at any time.

Not all of these are addressable:

- Assume:
  - 60–70% have access to a compatible device and parental support.
  - 30–40% of those families are open to digital math practice tools.
- This yields a **Serviceable Available Market (SAM)** of roughly:
  - ~50M children × 0.65 × 0.35 ≈ **11–12 million addressable children**.

**Implication for Ready Steady Math:**

- Capturing even **0.5–2%** of this SAM over several years means **55,000–240,000 active children** using Ready Steady Math, which is compatible with the earlier scenarios.

### 7.2 Base Scenario – Detailed 5-Year Projections (With Coach)

#### 7.2.1 Paying Parent Counts by Year

| Year | Household Sign-ups | Conversion Rate | New Paying Parents | Paying Teachers |
|------|--------------------|-----------------|--------------------|-----------------|
| Year 1 | 50,000 | 5.0% | 2,500 | 180 |
| Year 2 | 62,500 | 5.2% | 3,250 | 225 |
| Year 3 | 78,125 | 5.4% | 4,219 | 282 |
| Year 4 | 97,656 | 5.6% | 5,469 | 352 |
| Year 5 | 122,070 | 5.8% | 7,080 | 440 |
| **5-Year Total** | **410,351** | — | **22,518** | **1,479** |

#### 7.2.2 Coach Subscribers by Year (at Different Attach Rates)

| Year | New Paying Parents | 10% Attach | 20% Attach | 30% Attach |
|------|--------------------|-----------:|-----------:|-----------:|
| Year 1 | 2,500 | 250 | 500 | 750 |
| Year 2 | 3,250 | 325 | 650 | 975 |
| Year 3 | 4,219 | 422 | 844 | 1,266 |
| Year 4 | 5,469 | 547 | 1,094 | 1,641 |
| Year 5 | 7,080 | 708 | 1,416 | 2,124 |
| **5-Year Total** | 22,518 | **2,252** | **4,504** | **6,756** |

#### 7.2.3 Revenue Summary by Year (Base Scenario, 20% Coach Attach)

| Year | Core Revenue (Parents) | Core Revenue (Teachers) | Coach Sub Revenue | AI Credits | **Gross Revenue** |
|------|------------------------|-------------------------|-------------------|------------|-------------------|
| Year 1 | $17,475 | $3,596 | $14,200 | $1,000 | $36,271 |
| Year 2 | $22,718 | $4,496 | $18,460 | $1,300 | $46,974 |
| Year 3 | $29,491 | $5,634 | $23,970 | $1,690 | $60,785 |
| Year 4 | $38,228 | $7,034 | $31,070 | $2,195 | $78,527 |
| Year 5 | $49,489 | $8,789 | $40,214 | $2,845 | $101,337 |
| **5-Year Total** | **$157,401** | **$29,549** | **$127,914** | **$9,030** | **$323,894** |

#### 7.2.4 Net Contribution Summary (Base Scenario, 20% Coach Attach)

| Year | Gross Revenue | Payment Fees (5%) | Net After Fees | Opex | **Net Contribution** |
|------|---------------|-------------------|----------------|------|----------------------|
| Year 1 | $36,271 | $1,814 | $34,457 | $7,000 | $27,457 |
| Year 2 | $46,974 | $2,349 | $44,625 | $8,000 | $36,625 |
| Year 3 | $60,785 | $3,039 | $57,746 | $9,000 | $48,746 |
| Year 4 | $78,527 | $3,926 | $74,601 | $10,000 | $64,601 |
| Year 5 | $101,337 | $5,067 | $96,270 | $12,000 | $84,270 |
| **5-Year Total** | **$323,894** | **$16,195** | **$307,699** | **$46,000** | **$261,699** |

### 7.3 Five-Year Summary Comparison (With vs Without Coach)

#### Base Scenario – 5-Year Totals

| Model | Gross Revenue | Net After Fees | Opex | **Net Contribution** |
|-------|---------------|----------------|------|----------------------|
| **Without Coach** (Core + AI credits only) | ~$215,000 | ~$204,000 | ~$35,000 | **~$170,000** |
| **With Coach @ 10% attach** | ~$280,000 | ~$266,000 | ~$46,000 | **~$220,000** |
| **With Coach @ 20% attach** | ~$324,000 | ~$308,000 | ~$46,000 | **~$262,000** |
| **With Coach @ 30% attach** | ~$388,000 | ~$369,000 | ~$46,000 | **~$323,000** |

**Key insights:**

- **Without Coach:** 5-year net contribution is approximately **US$170,000** (as previously modelled).
- **With Coach at 10% attach (conservative):** Net contribution increases to approximately **US$220,000** (+29%).
- **With Coach at 20% attach (Base):** Net contribution increases to approximately **US$262,000** (+54%).
- **With Coach at 30% attach (stretch):** Net contribution increases to approximately **US$323,000** (+90%).

### 7.4 Low and High Scenario Impact

#### Low Scenario (5-Year Summary)

| Model | 5-Year Net Contribution |
|-------|-------------------------|
| Without Coach | ~$2,000–4,000 |
| With Coach @ 10% attach | ~$8,000–12,000 |
| With Coach @ 20% attach | ~$14,000–18,000 |

**Interpretation:** In the Low scenario, Coach helps cover infra costs but does not fundamentally change the picture. The model remains a side-project.

#### High Scenario (5-Year Summary)

| Model | 5-Year Net Contribution |
|-------|-------------------------|
| Without Coach | ~$1.1–1.3M |
| With Coach @ 20% attach | ~$1.4–1.6M |
| With Coach @ 30% attach | ~$1.6–1.9M |

**Interpretation:** In the High scenario, Coach adds **$300,000–600,000** in incremental 5-year contribution, significantly strengthening an already successful model.

### 7.5 Cohorts and Repeat Value

One nuance for a primary-age product: **children churn out of the target age band**, but new cohorts enter every year.

**Implications for Coach:**

- **Household subscriptions span multiple children:** A family with a 7-year-old and a 5-year-old may subscribe to Coach for 4–6 years as children rotate through.
- **Coach value compounds over time:** Weekly plans and monthly reports build a track record that makes the subscription stickier.
- **Sibling expansion:** Younger siblings entering the target age band extend subscription lifetime.

This strengthens the recurring revenue case for Coach versus one-off AI credits.

---

## 8. Break-Even and Sustainability Analysis

### 8.1 Original Break-Even (Without Coach)

Suppose you want to cover:

- One full-time developer/designer: **~$50,000/year** (very lean by Tier-1 standards).
- Part-time support/ops + miscellaneous: **~$10,000/year**.
- Infra + tools: **~$10,000/year**.

**Total to cover: ~$70,000/year.**

**Without Coach:**

- If 80% of revenue comes from home licences at $6.99 and 20% from teacher licences + AI packs.
- Average net per paying "customer equivalent" ≈ **$7.50** after fees (lower than previous $8.50 due to $6.99 price point).
- You need roughly: **$70,000 / $7.50 ≈ 9,300 paying customers per year.**

At 5% conversion, that requires **~186,000 household sign-ups per year** – between Base and High scenarios.

### 8.2 Break-Even with Coach Subscription

**How Coach changes the math:**

With 20% Coach attach among paying parents:

- Average net per paying parent increases from ~$6.64 (Core only) to **~$6.64 + (0.20 × $28.40) = ~$12.32**.
- Blended average net per paying customer ≈ **$10.50** (including teachers who don't subscribe to Coach).

**New break-even:**

- $70,000 / $10.50 ≈ **6,700 paying customers per year** (vs 9,300 without Coach).
- At 5% conversion: **~134,000 household sign-ups** (vs 186,000 without Coach).

**This is a 28% reduction in required scale to reach the same break-even point.**

### 8.3 Recurring vs One-Off Revenue Mix

**Benefits of adding recurring subscription revenue:**

1. **Predictability:** Monthly/annual subscription revenue is more predictable than one-time purchases tied to new customer acquisition.

2. **Cash flow smoothing:** Subscriptions generate revenue each month; one-time purchases are lumpy and depend on marketing/seasonality.

3. **Investment justification:** Recurring revenue makes it easier to justify ongoing investment in AI features, content, and support.

4. **Valuation impact:** Businesses with recurring revenue often command higher valuations than pure one-time purchase models.

**Illustrative revenue mix (Base scenario, Year 5 with 20% Coach attach):**

| Revenue Type | Annual Amount | % of Total |
|--------------|---------------|------------|
| One-time Core | $58,278 | 57.5% |
| Coach Subscription | $40,214 | 39.7% |
| AI Credits | $2,845 | 2.8% |
| **Total** | **$101,337** | **100%** |

By Year 5, **nearly 40% of revenue is recurring** from Coach subscriptions, providing a stable foundation for ongoing operations.

---

## 9. Conclusions & Recommendations

### 9.1 Is the Combined Model Viable?

Given:

- Very low marginal infra cost per user (local-first gameplay).
- Extremely low AI compute costs with modern small models.
- Competitive pricing for Tier-1 markets.
- Addition of low-cost Coach subscription.

The answer is:

- **Yes, commercially viable**: The combination of one-time Core unlock plus optional Coach subscription creates a sustainable model at Base-case adoption.
- **Significantly strengthened**: Coach subscription adds **US$50,000–150,000** in 5-year net contribution at realistic attach rates (10–30%), reducing the scale required to fund a small team.
- **Recurring revenue foundation**: Coach provides predictable monthly revenue that smooths cash flow and justifies ongoing investment.

### 9.2 Coach Subscription Pricing Validation

The decision to price Ready Steady Math Coach at **US$2.49/month** (with **US$23.99/year** annual option) is validated by:

**Competitive positioning:**

- Significantly cheaper than tutoring subscriptions ($20–100+/month).
- Cheaper than most "premium" educational app subscriptions ($5–15/month).
- Comparable to entertainment subscriptions that families already pay for.

**Value delivery:**

- Clear, concrete value: "Know exactly what to practice next week."
- Low cognitive burden: Simple plans, not complex dashboards.
- Ongoing engagement: Weekly plans, monthly reports, progress tracking.

**Financial impact:**

- Even at modest 10% attach, Coach adds meaningful revenue (~$64k over 5 years).
- At Base 20% attach, Coach increases 5-year net contribution by ~50%.
- Unit economics are excellent: >98% gross margin on subscription revenue.

### 9.3 Strategic Approach

**Short term (Launch → Year 1): Hybrid model**

- Launch with three monetisation paths:
  1. One-time Core unlock (primary)
  2. Optional Coach subscription (featured AI offering)
  3. Optional AI credit packs (secondary option)
- Monitor adoption of each path.
- Optimise Coach onboarding and value demonstration.

**Medium term (Year 1+ review): Potential simplification**

- If Coach adoption is strong (≥15% attach) and AI credit packs see low usage:
  - Consider phasing out credit packs for new users.
  - Move toward simpler "Core + Coach" model.
  - Honour existing credit purchases indefinitely.
- If credit packs show meaningful usage among a distinct segment:
  - Retain both options.
  - Consider whether credit users can be converted to Coach.

**Long term: Expand recurring revenue**

- Explore Teacher/School Coach subscription (class-level analytics).
- Consider bundled offerings (Core + Coach at slight discount).
- Evaluate annual-only pricing if monthly churn is problematic.

### 9.4 Practical Recommendations

1. **Launch Core unlock at US$6.99** – Low friction, premium-game positioning.

2. **Launch Coach at US$2.49/month** – Low enough to be a "no-brainer" add-on for engaged parents.

3. **Emphasise Coach's concrete value** – "Know exactly what to practice" is more compelling than "AI-powered insights."

4. **Design Coach for ongoing engagement** – Weekly plans, progress celebrations, term reports. Avoid "subscribe once, get report, cancel" pattern.

5. **Keep credit packs as fallback** – Some parents will prefer one-off purchases. Don't force subscriptions.

6. **Monitor key metrics from day one:**
   - Core conversion rate
   - Coach attach rate (vs target 20%)
   - Coach churn rate (target <8% monthly)
   - Credit pack vs Coach adoption comparison

7. **Review monetisation mix at 12 months** – Decide whether to simplify toward "Core + Coach" based on real data.

### 9.5 Final Assessment

The Ready Steady Math business model – **one-time Core unlock plus optional Ready Steady Math Coach subscription** – is commercially sound for a Tier-1 launch. The model:

- Maintains the parent-friendly "buy once" positioning for the core game.
- Adds meaningful recurring revenue through a low-cost AI subscription.
- Significantly improves 5-year financial sustainability.
- Reduces the customer acquisition scale required for break-even.
- Provides a foundation for future expansion (Teacher Coach, bundled offerings).

With disciplined execution on conversion, Coach value demonstration, and lean operations, this model can support a small team and ongoing product development, with significant upside in the High scenario.
