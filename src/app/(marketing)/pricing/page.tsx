import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { PricingPlans } from "./PricingPlans";
import { 
  Check, 
  X, 
  Sparkles, 
  Shield, 
  Zap, 
  Heart, 
  Crown, 
  Rocket,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Star,
  Users,
  Lock
} from "lucide-react";
import Image from "next/image";

const guarantees = [
  { icon: Shield, title: "No Hidden Fees", description: "One-time payment. No subscriptions, no surprises." },
  { icon: Lock, title: "Risk-Free", description: "Full refund within 7 days if you're not satisfied." },
  { icon: Zap, title: "Instant Access", description: "Premium features unlock immediately after purchase." },
];

const faqs = [
  {
    q: "Why a one-time payment instead of subscription?",
    a: "We believe families shouldn't have to pay forever for educational tools. Pay once, own it forever—including all future updates.",
  },
  {
    q: "Is Math Dash really kid-safe?",
    a: "Absolutely. No ads, no tracking, no chat features. Settings are protected behind a grown-ups gate. We're COPPA compliant and privacy-first.",
  },
  {
    q: "Does it work offline?",
    a: "Yes! All practice sessions, profiles, and progress work completely offline. Cloud sync is optional and only happens when you choose.",
  },
  {
    q: "Can I share Premium with my family?",
    a: "Yes! One Premium purchase covers your entire household. Create up to 6 profiles for all your kids on any of your devices.",
  },
  {
    q: "What ages is Math Dash designed for?",
    a: "Math Dash is optimized for ages 6-11, covering essential mental math skills from basic addition to multi-digit operations.",
  },
  {
    q: "What if I want a refund?",
    a: "No problem. Contact us within 7 days of purchase for a full refund—no questions asked.",
  },
];

export default function PricingPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} className={styles.badgeIcon} />
            Simple, Honest Pricing
          </div>
          
          <h1 className={styles.title}>
            One Price. <span className={styles.titleHighlight}>Forever.</span>
          </h1>
          
          <p className={styles.subtitle}>
            No subscriptions. No hidden fees. Just a simple one-time purchase 
            that unlocks everything—forever. Start free, upgrade when you're ready.
          </p>
        </div>
        
        <div className={styles.heroVisual}>
          <Image
            src="/mascots/mascot dashy - jumping in the air with joy hands in the air indicating success.png"
            alt="Dashy celebrating"
            width={200}
            height={200}
            className={styles.heroMascot}
          />
        </div>
      </section>

      {/* Plans Section */}
      <PricingPlans />

      {/* Guarantees Section */}
      <section className={styles.guaranteesSection}>
        <div className={styles.guaranteesGrid}>
          {guarantees.map((item, i) => (
            <div key={i} className={styles.guaranteeCard}>
              <div className={styles.guaranteeIcon}>
                <item.icon size={24} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className={styles.socialProof}>
        <div className={styles.proofInner}>
          <div className={styles.proofStat}>
            <Users size={24} className={styles.proofIcon} />
            <span className={styles.proofNumber}>10,000+</span>
            <span className={styles.proofLabel}>Happy Students</span>
          </div>
          <div className={styles.proofDivider} />
          <div className={styles.proofStat}>
            <Star size={24} className={styles.proofIcon} />
            <span className={styles.proofNumber}>4.9★</span>
            <span className={styles.proofLabel}>Average Rating</span>
          </div>
          <div className={styles.proofDivider} />
          <div className={styles.proofStat}>
            <Heart size={24} className={styles.proofIcon} />
            <span className={styles.proofNumber}>98%</span>
            <span className={styles.proofLabel}>Would Recommend</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <HelpCircle size={24} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p className={styles.sectionSubtitle}>Everything you need to know about Math Dash pricing</p>
        </div>
        
        <div className={styles.faqGrid}>
          {faqs.map((item, i) => (
            <details key={i} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                {item.q}
                <ChevronDown size={20} className={styles.faqChevron} />
              </summary>
              <p className={styles.faqAnswer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to unlock your child's math potential?</h2>
          <p className={styles.ctaText}>
            Start free today. No credit card required.
          </p>
          <div className={styles.ctaButtons}>
            <LinkButton href="/play" size="md" className={styles.ctaPrimary}>
              <Rocket size={18} />
              Play Free Now
            </LinkButton>
          </div>
          <div className={styles.ctaGuarantees}>
            <span><CheckCircle2 size={14} /> Free to start</span>
            <span><CheckCircle2 size={14} /> No credit card needed</span>
            <span><CheckCircle2 size={14} /> 7-day money-back guarantee</span>
          </div>
        </div>
      </section>
    </div>
  );
}
