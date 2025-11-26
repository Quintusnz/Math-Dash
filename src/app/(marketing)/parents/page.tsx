import Image from "next/image";
import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Heart, 
  Star, 
  CheckCircle2, 
  Brain, 
  Sparkles,
  Lock,
  Eye,
  Users,
  Award
} from "lucide-react";

const TRUST_SIGNALS = [
  { icon: ShieldCheck, label: "No Ads Ever", description: "Zero advertisements, zero distractions" },
  { icon: Lock, label: "Privacy First", description: "COPPA & GDPR-K compliant" },
  { icon: Eye, label: "No Tracking", description: "We never sell or share data" },
  { icon: Users, label: "Parent Controls", description: "You're always in charge" },
];

const BENEFITS = [
  {
    icon: Clock,
    title: "Just 5-10 Minutes a Day",
    description: "Short, focused sessions that fit into any schedule. No marathon study sessions—just quick, effective practice that builds lasting skills.",
  },
  {
    icon: Brain,
    title: "Builds Mental Math Fluency",
    description: "Your child develops automatic recall of math facts—the foundation that makes all future math easier and less stressful.",
  },
  {
    icon: TrendingUp,
    title: "Adapts to Your Child",
    description: "Our smart system finds the perfect challenge level. Not too easy, not too hard—just right for building confidence and competence.",
  },
  {
    icon: Heart,
    title: "They'll Actually Want to Practice",
    description: "Game-like sprints, streaks, and rewards turn 'have to' into 'want to'. Practice feels like play.",
  },
];

const TESTIMONIALS = [
  {
    quote: "My daughter used to dread math homework. Now she asks to play Math Dash before bed!",
    author: "Sarah M.",
    role: "Parent of 8-year-old",
    rating: 5,
  },
  {
    quote: "Within 3 weeks, my son went from struggling with times tables to knowing them cold. The difference in his confidence is incredible.",
    author: "James P.",
    role: "Parent of 10-year-old",
    rating: 5,
  },
  {
    quote: "Finally, an app I feel good about letting my kids use. No ads popping up, no chat features—just focused learning.",
    author: "Maria L.",
    role: "Mother of two",
    rating: 5,
  },
];

const COMPARISON = [
  { feature: "Zero Advertisements", mathDash: true, others: false },
  { feature: "Adapts to Your Child's Level", mathDash: true, others: false },
  { feature: "Visual Progress Dashboard for Parents", mathDash: true, others: false },
  { feature: "Works Offline", mathDash: true, others: false },
  { feature: "No Chat or Social Features", mathDash: true, others: false },
  { feature: "COPPA Compliant", mathDash: true, others: "varies" },
];

export default function ParentsLandingPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.trustBadge}>
            <ShieldCheck size={16} />
            Trusted by Parents • Safe for Kids
          </div>
          
          <h1 className={styles.headline}>
            Your Child Can Master Mental Math
            <span className={styles.headlineAccent}> in Just Minutes a Day</span>
          </h1>
          
          <p className={styles.subheadline}>
            Math Dash is the ad-free, kid-safe app that turns math practice into a game 
            they actually want to play. Watch their confidence soar as they build 
            essential number skills through quick, engaging challenges.
          </p>

          <div className={styles.heroActions}>
            <LinkButton href="/play" size="md" className={styles.primaryCta}>
              Try It Free — No Credit Card Needed
            </LinkButton>
            <span className={styles.ctaNote}>
              <CheckCircle2 size={14} />
              Set up in under 60 seconds
            </span>
          </div>

          <div className={styles.trustGrid}>
            {TRUST_SIGNALS.map((signal, i) => (
              <div key={i} className={styles.trustItem}>
                <signal.icon size={20} className={styles.trustIcon} />
                <div className={styles.trustText}>
                  <span className={styles.trustLabel}>{signal.label}</span>
                  <span className={styles.trustDesc}>{signal.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.deviceFrame}>
            <div className={styles.deviceScreen}>
              <Image
                src="/logos/logo-3d.png"
                alt="Math Dash game screen"
                width={320}
                height={320}
                className={styles.appPreview}
                priority
              />
            </div>
          </div>
          <div className={styles.floatingBadge} style={{ top: '10%', right: '-20px' }}>
            <Sparkles size={16} /> Fun!
          </div>
          <div className={styles.floatingBadge} style={{ bottom: '20%', left: '-30px' }}>
            <Award size={16} /> Safe
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className={styles.problemSection}>
        <div className={styles.problemCard}>
          <h2 className={styles.problemTitle}>Does This Sound Familiar?</h2>
          <ul className={styles.problemList}>
            <li>
              <span className={styles.problemEmoji}>😩</span>
              Homework battles over math facts
            </li>
            <li>
              <span className={styles.problemEmoji}>📱</span>
              Worried about screen time that&apos;s not productive
            </li>
            <li>
              <span className={styles.problemEmoji}>🎯</span>
              Hard to find apps that are actually educational AND engaging
            </li>
            <li>
              <span className={styles.problemEmoji}>🚫</span>
              Frustrated by ads and in-app purchases in &quot;free&quot; apps
            </li>
          </ul>
        </div>

        <div className={styles.arrowDown}>
          <span className={styles.arrowIcon}>↓</span>
        </div>

        <div className={styles.solutionCard}>
          <h2 className={styles.solutionTitle}>There&apos;s a Better Way</h2>
          <p className={styles.solutionText}>
            Math Dash was built by parents who understand. We created the app we wished 
            existed—one that&apos;s genuinely fun, completely safe, and actually works.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Why Parents Love It</span>
          <h2 className={styles.sectionTitle}>Real Benefits, Real Results</h2>
          <p className={styles.sectionSubtitle}>
            Built around what actually helps kids learn—and what busy parents need.
          </p>
        </div>

        <div className={styles.benefitsGrid}>
          {BENEFITS.map((benefit, i) => (
            <div key={i} className={styles.benefitCard}>
              <div className={styles.benefitIconWrapper}>
                <benefit.icon size={28} />
              </div>
              <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              <p className={styles.benefitDescription}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Simple & Effective</span>
          <h2 className={styles.sectionTitle}>How Math Dash Works</h2>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Choose a Skill</h3>
            <p>Addition, subtraction, multiplication, division—pick what your child needs to practice.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Start a Dash</h3>
            <p>Quick 60-second rounds with instant feedback. Questions adapt to their level.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Watch Them Grow</h3>
            <p>Track progress with our parent dashboard. See exactly what they&apos;ve mastered.</p>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className={styles.safetySection}>
        <div className={styles.safetyContent}>
          <div className={styles.safetyText}>
            <span className={styles.sectionTag}>Your Peace of Mind</span>
            <h2 className={styles.sectionTitle}>Built for Safety, Designed for Learning</h2>
            <p className={styles.safetyDescription}>
              We take your child&apos;s safety seriously. Math Dash is designed from the ground up 
              to be a distraction-free, worry-free learning environment.
            </p>
            
            <ul className={styles.safetyChecklist}>
              <li>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <div>
                  <strong>No Advertisements—Ever</strong>
                  <span>Your child won&apos;t be interrupted or exposed to inappropriate ads</span>
                </div>
              </li>
              <li>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <div>
                  <strong>No Chat or Social Features</strong>
                  <span>No strangers can contact your child through our app</span>
                </div>
              </li>
              <li>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <div>
                  <strong>Parent-Gated Settings</strong>
                  <span>Purchases and settings are protected by a grown-ups only gate</span>
                </div>
              </li>
              <li>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <div>
                  <strong>COPPA & GDPR-K Compliant</strong>
                  <span>We follow the strictest child privacy regulations</span>
                </div>
              </li>
              <li>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <div>
                  <strong>Works Offline</strong>
                  <span>Practice anywhere, even without internet</span>
                </div>
              </li>
            </ul>
          </div>

          <div className={styles.safetyVisual}>
            <div className={styles.shieldGraphic}>
              <ShieldCheck size={80} />
              <span>100% Kid-Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className={styles.comparisonSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>The Difference</span>
          <h2 className={styles.sectionTitle}>Math Dash vs. Other Apps</h2>
        </div>

        <div className={styles.comparisonTable}>
          <div className={styles.comparisonHeader}>
            <div className={styles.comparisonFeature}>Feature</div>
            <div className={styles.comparisonMathDash}>Math Dash</div>
            <div className={styles.comparisonOthers}>Typical Apps</div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>{row.feature}</div>
              <div className={styles.comparisonMathDash}>
                {row.mathDash === true ? (
                  <CheckCircle2 className={styles.checkMark} size={22} />
                ) : (
                  <span className={styles.xMark}>✕</span>
                )}
              </div>
              <div className={styles.comparisonOthers}>
                {row.others === true ? (
                  <CheckCircle2 className={styles.checkMark} size={22} />
                ) : row.others === "varies" ? (
                  <span className={styles.varies}>Varies</span>
                ) : (
                  <span className={styles.xMark}>✕</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Real Stories</span>
          <h2 className={styles.sectionTitle}>Parents Are Seeing Results</h2>
        </div>

        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} size={18} fill="currentColor" />
                ))}
              </div>
              <blockquote className={styles.testimonialQuote}>
                &quot;{testimonial.quote}&quot;
              </blockquote>
              <div className={styles.testimonialAuthor}>
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Common Questions</span>
          <h2 className={styles.sectionTitle}>Parents Ask, We Answer</h2>
        </div>

        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3>Is Math Dash really free?</h3>
            <p>
              Yes! The core game is completely free. Premium features are available 
              for families who want more, but there&apos;s no pressure to upgrade.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>What ages is Math Dash for?</h3>
            <p>
              Math Dash is designed for children ages 6-11 (roughly Years 1-6 or 
              Kindergarten through 5th grade). The adaptive system ensures appropriate 
              challenge for each child.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>How much time should my child spend on it?</h3>
            <p>
              We recommend 5-10 minutes daily for best results. Short, consistent 
              practice is more effective than long, occasional sessions.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>Can I see what my child is learning?</h3>
            <p>
              Absolutely! Our parent dashboard shows exactly which skills your child 
              has practiced, where they&apos;re strong, and what needs more work.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaContent}>
          <h2 className={styles.finalCtaTitle}>
            Give Your Child the Gift of Math Confidence
          </h2>
          <p className={styles.finalCtaText}>
            Join thousands of families who&apos;ve discovered a better way to practice math. 
            No risk, no credit card required—just sign up and start playing.
          </p>
          
          <div className={styles.finalCtaActions}>
            <LinkButton href="/play" size="md" className={styles.finalCtaButton}>
              Start Free Today
            </LinkButton>
          </div>

          <div className={styles.guaranteeRow}>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>Free to try, no credit card</span>
            </div>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>Set up in under 60 seconds</span>
            </div>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
