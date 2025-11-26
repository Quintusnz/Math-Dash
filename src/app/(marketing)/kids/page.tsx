"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { 
  Zap, 
  Star, 
  Trophy,
  Flame,
  Sparkles,
  Target,
  Rocket
} from "lucide-react";
import { motion } from "framer-motion";

const FLOATING_SYMBOLS = ["+", "−", "×", "÷", "=", "7", "3", "9", "5", "★"];

const FUN_FEATURES = [
  {
    icon: Zap,
    title: "Super Fast Rounds",
    description: "60-second speed challenges!",
    color: "var(--color-accent-gold)",
  },
  {
    icon: Flame,
    title: "Build Your Streak",
    description: "Play every day to grow your flame!",
    color: "var(--color-accent-coral)",
  },
  {
    icon: Trophy,
    title: "Earn Trophies",
    description: "Collect awesome achievements!",
    color: "var(--color-primary-500)",
  },
  {
    icon: Star,
    title: "Level Up",
    description: "Watch your skills grow!",
    color: "var(--color-secondary-500)",
  },
];

const MATH_TOPICS = [
  { name: "Addition", emoji: "➕", color: "#38BDF8" },
  { name: "Subtraction", emoji: "➖", color: "#FF5A7A" },
  { name: "Times Tables", emoji: "✖️", color: "#FFB224" },
  { name: "Division", emoji: "➗", color: "#1FB8A6" },
];

export default function KidsLandingPage() {
  return (
    <div className={styles.page}>
      {/* Floating Math Symbols Background */}
      <div className={styles.floatingSymbols} aria-hidden="true">
        {FLOATING_SYMBOLS.map((symbol, i) => (
          <motion.span
            key={i}
            className={styles.floatingSymbol}
            initial={{ y: 0, opacity: 0.3 }}
            animate={{ 
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            style={{
              left: `${5 + (i * 9)}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
          >
            {symbol}
          </motion.span>
        ))}
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className={styles.heroBadge}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={18} />
            Are You Ready to Dash?
          </motion.div>
          
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine1}>Become a</span>
            <span className={styles.titleLine2}>
              <motion.span
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className={styles.gradientText}
              >
                Math Champion!
              </motion.span>
            </span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Race against the clock, answer questions super fast, 
            and show everyone how awesome you are at math!
          </p>

          <motion.div 
            className={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <LinkButton href="/play" size="md" className={styles.playButton}>
              <Rocket size={20} />
              Let&apos;s Play!
            </LinkButton>
          </motion.div>
        </motion.div>

        <div className={styles.heroVisual}>
          <motion.div 
            className={styles.mascotContainer}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.8, 
              type: "spring",
              bounce: 0.4
            }}
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/mascots/mascot dashy - jumping in the air with joy hands in the air indicating success.png"
                alt="Dashy the squirrel jumping with joy"
                width={400}
                height={400}
                className={styles.mascotMain}
                priority
              />
            </motion.div>
            
            {/* Sparkle effects around Dashy */}
            <motion.div
              className={styles.sparkle}
              style={{ top: '10%', left: '10%' }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              <Sparkles size={24} />
            </motion.div>
            <motion.div
              className={styles.sparkle}
              style={{ top: '20%', right: '15%' }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              <Star size={20} />
            </motion.div>
            <motion.div
              className={styles.sparkle}
              style={{ bottom: '30%', left: '5%' }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            >
              <Zap size={22} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Meet Dashy Section */}
      <section className={styles.meetDashy}>
        <motion.div 
          className={styles.dashyIntro}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.speechBubble}>
            <h2>Hi, I&apos;m Dashy!</h2>
            <p>
              I&apos;m a super speedy squirrel who LOVES math! 
              I&apos;ll be your buddy as you learn to answer questions 
              lightning fast. Ready to race? 🐿️⚡
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.dashyImage}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/mascots/mascot dashy - thumbs up smiling indicating all good and success.png"
              alt="Dashy giving a thumbs up"
              width={300}
              height={300}
              className={styles.dashyThumbsUp}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* What You'll Do Section */}
      <section className={styles.whatYouDo}>
        <motion.div 
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.funTitle}>
            <span className={styles.titleEmoji}>🎮</span>
            What You&apos;ll Do
            <span className={styles.titleEmoji}>🎯</span>
          </h2>
        </motion.div>

        <div className={styles.stepsTimeline}>
          <motion.div 
            className={styles.timelineStep}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Pick Your Challenge</h3>
              <p>Choose addition, times tables, or any math skill you want to master!</p>
            </div>
            <div className={styles.stepVisual}>
              <Target size={48} className={styles.stepIcon} />
            </div>
          </motion.div>

          <motion.div 
            className={styles.timelineStep}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.stepVisual}>
              <Zap size={48} className={styles.stepIcon} />
            </div>
            <div className={styles.stepContent}>
              <h3>Race the Clock!</h3>
              <p>Answer as many questions as you can in 60 seconds. GO GO GO!</p>
            </div>
            <div className={styles.stepNumber}>2</div>
          </motion.div>

          <motion.div 
            className={styles.timelineStep}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Beat Your Best!</h3>
              <p>Try to beat your high score every time. You&apos;ll get faster and faster!</p>
            </div>
            <div className={styles.stepVisual}>
              <Trophy size={48} className={styles.stepIcon} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Math Topics Carousel */}
      <section className={styles.topicsSection}>
        <motion.h2 
          className={styles.funTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.titleEmoji}>🧮</span>
          Practice These Skills
          <span className={styles.titleEmoji}>🔢</span>
        </motion.h2>

        <div className={styles.topicsTrack}>
          <motion.div 
            className={styles.topicsCarousel}
            animate={{ x: [0, -50, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {[...MATH_TOPICS, ...MATH_TOPICS].map((topic, i) => (
              <motion.div 
                key={i} 
                className={styles.topicCard}
                style={{ borderColor: topic.color }}
                whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
              >
                <span className={styles.topicEmoji}>{topic.emoji}</span>
                <span className={styles.topicName}>{topic.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Fun Features */}
      <section className={styles.featuresSection}>
        <motion.h2 
          className={styles.funTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.titleEmoji}>✨</span>
          Awesome Stuff Inside
          <span className={styles.titleEmoji}>🌟</span>
        </motion.h2>

        <div className={styles.featuresGrid}>
          {FUN_FEATURES.map((feature, i) => (
            <motion.div 
              key={i} 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className={styles.featureIcon}
                style={{ background: feature.color }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <feature.icon size={32} />
              </motion.div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dashy Encouragement */}
      <section className={styles.encouragement}>
        <motion.div 
          className={styles.encouragementCard}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className={styles.encouragementContent}>
            <motion.h2
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              You&apos;ve Got This! 💪
            </motion.h2>
            <p>
              Every math champion started somewhere. Don&apos;t worry if you make mistakes – 
              that&apos;s how you learn! Dashy believes in you!
            </p>
            <div className={styles.encouragementTips}>
              <div className={styles.tip}>
                <span>🎯</span> Start easy, then level up
              </div>
              <div className={styles.tip}>
                <span>⏱️</span> Practice a little every day
              </div>
              <div className={styles.tip}>
                <span>🎉</span> Celebrate your wins!
              </div>
            </div>
          </div>
          <motion.div 
            className={styles.encouragementMascot}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/mascots/mascot dashy - thumbs up with math symbols around him.png"
              alt="Dashy with math symbols"
              width={280}
              height={280}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <motion.div 
          className={styles.ctaContent}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className={styles.ctaMascot}
            animate={{ 
              y: [0, -20, 0],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/mascots/mascot dashy - stance is ready for a sprint with a determined look.png"
              alt="Dashy ready to sprint"
              width={200}
              height={200}
            />
          </motion.div>
          
          <h2 className={styles.ctaTitle}>
            Ready to Start Your Adventure?
          </h2>
          
          <p className={styles.ctaText}>
            Dashy is waiting to race with you! Let&apos;s see how fast you can go! 🏃‍♂️💨
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LinkButton href="/play" size="md" className={styles.bigPlayButton}>
              <Rocket size={24} />
              Start Playing Now!
            </LinkButton>
          </motion.div>

          <div className={styles.funFacts}>
            <motion.div 
              className={styles.funFact}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              <span>🆓</span> It&apos;s FREE!
            </motion.div>
            <motion.div 
              className={styles.funFact}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            >
              <span>🎮</span> Super Fun!
            </motion.div>
            <motion.div 
              className={styles.funFact}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            >
              <span>🧠</span> Get Smarter!
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
