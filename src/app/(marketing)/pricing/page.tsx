import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    badge: "Great for getting started",
    features: [
      "Unlimited 60-second sessions",
      "Offline-first play",
      "Profiles for kids",
      "Grown-ups gate for settings",
    ],
    cta: { label: "Start Playing", href: "/play" },
  },
  {
    name: "Premium",
    price: "$4.99",
    cadence: "per month",
    badge: "Family favorite",
    features: [
      "Progress insights & streaks",
      "Skill radar and history",
      "Priority sync across devices",
      "Upcoming: custom challenges",
    ],
    cta: { label: "Upgrade", href: "/grown-ups" },
    primary: true,
  },
];

const faqs = [
  {
    q: "Is Math Dash kid-safe?",
    a: "Yes. We keep settings behind a grown-ups gate, store data locally by default, and maintain AA contrast for accessibility.",
  },
  {
    q: "Do you work offline?",
    a: "Absolutely. Sessions, profiles, and mastery data work offline. Sync is optional when you reconnect.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Premium is month-to-month. Cancel anytime from the grown-ups area.",
  },
  {
    q: "Will ads interrupt the experience?",
    a: "No ads in Math Dash—we keep the experience clean and focused for kids.",
  },
];

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Clear, family-friendly pricing.</h1>
        <p className={styles.subtitle}>
          Start free. Stay free. Upgrade when you want deeper insights and sync—without ever sacrificing speed or safety.
        </p>
      </section>

      <section className={styles.plans}>
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={styles.plan}
            elevated={plan.primary}
          >
            <div className={styles.planHeader}>
              <div>
                <p className={styles.pill}>{plan.badge}</p>
                <h3 className={styles.planName}>{plan.name}</h3>
              </div>
              <p className={styles.price}>
                {plan.price} <span>{plan.cadence}</span>
              </p>
            </div>

            <ul className={styles.featureList}>
              {plan.features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <strong>•</strong>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <LinkButton href={plan.cta.href} size="lg">
              {plan.cta.label}
            </LinkButton>
            {plan.primary && (
              <p className={styles.note}>Includes AA contrast & accessibility best practices.</p>
            )}
          </Card>
        ))}
      </section>

      <section className={styles.faq}>
        {faqs.map((item) => (
          <div key={item.q} className={styles.faqItem}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
