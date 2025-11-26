import Image from "next/image";
import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { 
  Users, 
  Clock, 
  BarChart3, 
  Zap, 
  CheckCircle2, 
  Laptop,
  Monitor,
  Smartphone,
  ShieldCheck,
  BookOpen,
  Target,
  TrendingUp,
  Star,
  Sparkles,
  Layout,
  Timer,
  Award
} from "lucide-react";

const QUICK_WINS = [
  { icon: Timer, label: "Ready in Seconds", description: "No login required for students" },
  { icon: Laptop, label: "Any Device", description: "Chromebooks, tablets, phones" },
  { icon: ShieldCheck, label: "School Safe", description: "No ads, no chat, COPPA compliant" },
  { icon: Zap, label: "Instant Engagement", description: "Kids love the game format" },
];

const CLASSROOM_BENEFITS = [
  {
    icon: Clock,
    title: "Perfect 5-Minute Warm-Up",
    description: "Start your maths lesson with focused fluency practice. Students are engaged from the first bell, ready to learn.",
  },
  {
    icon: BarChart3,
    title: "See Who Needs Support",
    description: "Quick visual dashboard shows which students are struggling with which facts. Identify gaps at a glance, not after marking.",
  },
  {
    icon: Target,
    title: "Curriculum-Aligned Skills",
    description: "Covers addition, subtraction, multiplication, and division facts aligned to primary curriculum expectations (Years 1-6).",
  },
  {
    icon: TrendingUp,
    title: "Track Progress Over Time",
    description: "Watch your class improve week by week. Celebrate wins and focus intervention where it's needed most.",
  },
];

const SETUP_STEPS = [
  {
    number: "1",
    title: "Create Your Class",
    description: "Set up your class in under 2 minutes. No complex configuration needed.",
  },
  {
    number: "2",
    title: "Share the Code",
    description: "Students join with a simple class code. No emails or passwords required.",
  },
  {
    number: "3",
    title: "Start Practising",
    description: "Choose a topic and let students dash! Use it as a starter, filler, or homework.",
  },
];

const USE_CASES = [
  {
    icon: Sparkles,
    title: "Morning Starter",
    description: "Students arrive, open Math Dash, and start practising while you take the register. Calm, focused starts.",
  },
  {
    icon: BookOpen,
    title: "Lesson Warm-Up",
    description: "5 minutes of times tables before your multiplication lesson. Prime their brains for learning.",
  },
  {
    icon: Award,
    title: "Weekly Challenge",
    description: "Set a class goal for the week. Build friendly competition and celebrate improvements together.",
  },
  {
    icon: Layout,
    title: "Homework Alternative",
    description: "Assign 10 minutes of Math Dash instead of worksheets. Kids actually do it—and enjoy it.",
  },
];

const TESTIMONIALS = [
  {
    quote: "My Year 4s are obsessed. They ask to play Math Dash as a reward! Meanwhile, their times tables recall has improved dramatically.",
    author: "Miss Thompson",
    role: "Year 4 Teacher, Manchester",
    rating: 5,
  },
  {
    quote: "Finally, something that works on our ancient Chromebooks and doesn't need 15 minutes of login faff. The kids are practising and I can see who needs help.",
    author: "Mr. Davies",
    role: "Year 3 Teacher, Cardiff",
    rating: 5,
  },
  {
    quote: "I use it every morning as a starter. The classroom is calm, focused, and ready to learn by the time I've finished the register.",
    author: "Mrs. Okonkwo",
    role: "Year 5 Teacher, London",
    rating: 5,
  },
];

const COMPARISON = [
  { feature: "Works on Chromebooks", mathDash: true, others: "varies" },
  { feature: "No Student Emails Required", mathDash: true, others: false },
  { feature: "Setup in Under 5 Minutes", mathDash: true, others: false },
  { feature: "Free Core Features", mathDash: true, others: "varies" },
  { feature: "Visual Class Dashboard", mathDash: true, others: "varies" },
  { feature: "No Advertisements", mathDash: true, others: false },
  { feature: "Offline Capable", mathDash: true, others: false },
];

const FAQ_ITEMS = [
  {
    question: "Do my students need email addresses?",
    answer: "No! Students join with a simple class code and create a nickname. No emails, no passwords, no hassle.",
  },
  {
    question: "Does it work on school Chromebooks?",
    answer: "Absolutely. Math Dash is browser-based and works on Chromebooks, iPads, laptops, and even phones. If it has a browser, it works.",
  },
  {
    question: "Is there a cost for schools?",
    answer: "The core features are free forever. Premium features for schools are available at affordable rates with volume discounts.",
  },
  {
    question: "How does it align with the curriculum?",
    answer: "Math Dash covers number facts for Years 1-6, including addition/subtraction bonds, times tables, division facts, and more—all mapped to National Curriculum expectations.",
  },
  {
    question: "Can I see individual student progress?",
    answer: "Yes! Your teacher dashboard shows each student's strengths, gaps, and improvement over time. Perfect for parent conferences and intervention planning.",
  },
  {
    question: "What about GDPR and data protection?",
    answer: "We're fully GDPR compliant. We collect minimal data, never sell it, and you can delete class data at any time.",
  },
];

export default function TeachersLandingPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.trustBadge}>
            <Users size={16} />
            Built for Busy Teachers
          </div>
          
          <h1 className={styles.headline}>
            Mental Maths Practice
            <span className={styles.headlineAccent}> That Actually Works in Class</span>
          </h1>
          
          <p className={styles.subheadline}>
            Math Dash gives you a ready-to-use fluency tool that works on any device, 
            requires zero setup time, and keeps students genuinely engaged. 
            See who&apos;s struggling at a glance—not after hours of marking.
          </p>

          <div className={styles.heroActions}>
            <LinkButton href="/play" size="md" className={styles.primaryCta}>
              Try It With Your Class — Free
            </LinkButton>
            <span className={styles.ctaNote}>
              <CheckCircle2 size={14} />
              No credit card • No student emails • Works immediately
            </span>
          </div>

          <div className={styles.trustGrid}>
            {QUICK_WINS.map((item, i) => (
              <div key={i} className={styles.trustItem}>
                <item.icon size={20} className={styles.trustIcon} />
                <div className={styles.trustText}>
                  <span className={styles.trustLabel}>{item.label}</span>
                  <span className={styles.trustDesc}>{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.deviceStack}>
            <div className={styles.deviceLaptop}>
              <Monitor size={180} strokeWidth={0.5} className={styles.deviceIcon} />
              <span className={styles.deviceLabel}>Teacher Dashboard</span>
            </div>
            <div className={styles.deviceTablet}>
              <Laptop size={80} strokeWidth={1} className={styles.deviceIcon} />
            </div>
            <div className={styles.devicePhone}>
              <Smartphone size={50} strokeWidth={1} className={styles.deviceIcon} />
            </div>
          </div>
          <div className={styles.floatingBadge} style={{ top: '5%', right: '0' }}>
            <Zap size={16} /> Quick Setup
          </div>
          <div className={styles.floatingBadge} style={{ bottom: '15%', left: '-20px' }}>
            <BarChart3 size={16} /> Track Progress
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className={styles.painSection}>
        <div className={styles.painCard}>
          <h2 className={styles.painTitle}>Sound Familiar?</h2>
          <ul className={styles.painList}>
            <li>
              <span className={styles.painEmoji}>⏰</span>
              <div>
                <strong>No time to set up complex platforms</strong>
                <span>Between planning, marking, and everything else</span>
              </div>
            </li>
            <li>
              <span className={styles.painEmoji}>💻</span>
              <div>
                <strong>Mixed devices in your classroom</strong>
                <span>Chromebooks, tablets, that one ancient laptop...</span>
              </div>
            </li>
            <li>
              <span className={styles.painEmoji}>📊</span>
              <div>
                <strong>Hard to spot who&apos;s struggling</strong>
                <span>Until you&apos;ve marked 30 worksheets</span>
              </div>
            </li>
            <li>
              <span className={styles.painEmoji}>😴</span>
              <div>
                <strong>Boring drills that kids resist</strong>
                <span>The sighs when you mention times tables practice</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Why Teachers Choose Math Dash</span>
          <h2 className={styles.sectionTitle}>Save Time. See Results. Keep Kids Engaged.</h2>
          <p className={styles.sectionSubtitle}>
            Designed around the realities of classroom life—because we talked to real teachers.
          </p>
        </div>

        <div className={styles.benefitsGrid}>
          {CLASSROOM_BENEFITS.map((benefit, i) => (
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

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Get Started Today</span>
          <h2 className={styles.sectionTitle}>Up and Running in Minutes</h2>
          <p className={styles.sectionSubtitle}>
            No IT requests. No lengthy onboarding. Just start using it.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          {SETUP_STEPS.map((step, i) => (
            <div key={i} className={styles.stepWrapper}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {i < SETUP_STEPS.length - 1 && <div className={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className={styles.useCasesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Flexible for Your Timetable</span>
          <h2 className={styles.sectionTitle}>How Teachers Use Math Dash</h2>
        </div>

        <div className={styles.useCasesGrid}>
          {USE_CASES.map((useCase, i) => (
            <div key={i} className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>
                <useCase.icon size={24} />
              </div>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>From Real Classrooms</span>
          <h2 className={styles.sectionTitle}>Teachers Are Seeing the Difference</h2>
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

      {/* Comparison */}
      <section className={styles.comparisonSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>The Practical Choice</span>
          <h2 className={styles.sectionTitle}>Math Dash vs. Other Platforms</h2>
        </div>

        <div className={styles.comparisonTable}>
          <div className={styles.comparisonHeader}>
            <div className={styles.comparisonFeature}>Feature</div>
            <div className={styles.comparisonMathDash}>Math Dash</div>
            <div className={styles.comparisonOthers}>Others</div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} className={styles.comparisonRow}>
              <div className={styles.comparisonFeature}>{row.feature}</div>
              <div className={styles.comparisonMathDash}>
                {row.mathDash === true ? (
                  <CheckCircle2 className={styles.checkMark} size={22} />
                ) : (
                  <span className={styles.varies}>{row.mathDash}</span>
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

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Your Questions Answered</span>
          <h2 className={styles.sectionTitle}>Common Teacher Questions</h2>
        </div>

        <div className={styles.faqGrid}>
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaContent}>
          <h2 className={styles.finalCtaTitle}>
            Ready to Transform Maths Fluency in Your Classroom?
          </h2>
          <p className={styles.finalCtaText}>
            Join hundreds of teachers who&apos;ve found a better way to build number facts. 
            Start free today—your students will thank you.
          </p>
          
          <div className={styles.finalCtaActions}>
            <LinkButton href="/play" size="md" className={styles.finalCtaButton}>
              Get Started Free
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="md" className={styles.finalCtaSecondary}>
              View School Plans
            </LinkButton>
          </div>

          <div className={styles.guaranteeRow}>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>Free core features forever</span>
            </div>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>No student emails needed</span>
            </div>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>Works on all devices</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
