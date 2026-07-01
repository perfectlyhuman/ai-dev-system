# /landing-page - Premium Landing Page Builder

## Purpose
Build Awwwards-quality landing pages using Next.js + Framer Motion + Tailwind CSS. Output should be on par with the best Framer marketplace templates — smooth scroll animations, polished micro-interactions, and high-converting layout.

## Usage
```
/landing-page                    # Start from scratch with guided discovery
/landing-page [description]      # Build landing page for a specific product/feature
```

## Mode
- **Read from**: Codebase (existing theme, components, brand), User input
- **Write to**: Codebase (pages, components, styles)

---

## Design Quality Bar

The output must feel like a $79-149 Framer marketplace template. That means:

### Visual Standards
- **Fluid typography**: `clamp()` for all heading sizes, never fixed px
- **Generous whitespace**: Sections need breathing room (py-24 to py-32 minimum)
- **Subtle gradients**: Background gradients, text gradients, border gradients
- **Depth and layering**: Overlapping elements, z-index composition, glassmorphism where appropriate
- **Consistent spacing rhythm**: 4/8/16/24/32/48/64/96px scale
- **Dark mode considered**: Design for both if the project supports it

### Animation Standards
- Every section animates on scroll entry (fade-in-up is the baseline, not the ceiling)
- Staggered children for any list/grid of items
- Parallax on hero backgrounds or accent elements
- Smooth hover states on all interactive elements (scale, glow, color shift)
- Page load sequence: hero content staggers in, then scroll-triggered sections take over
- Spring physics over tweens for UI interactions
- Respect `prefers-reduced-motion`

---

## Architecture

### Dependencies
```bash
npm install framer-motion
```

### File Structure
```
app/(marketing)/
├── page.tsx                          # Landing page (Server Component shell)
├── _components/
│   ├── hero.tsx                      # Hero section (client)
│   ├── section-features.tsx          # Features grid
│   ├── section-social-proof.tsx      # Logos, stats, testimonials
│   ├── section-how-it-works.tsx      # 3-step process
│   ├── section-testimonials.tsx      # Customer quotes
│   ├── section-pricing.tsx           # Pricing tiers
│   ├── section-faq.tsx               # FAQ accordion
│   ├── section-cta.tsx               # Final CTA
│   └── shared/
│       ├── animated-section.tsx      # Scroll-triggered wrapper
│       ├── animated-text.tsx         # Text reveal animations
│       └── transitions.ts           # Shared spring/tween presets
```

### Shared Animation Utilities

```tsx
// _components/shared/transitions.ts
export const transitions = {
  spring: { type: 'spring', stiffness: 300, damping: 24 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 15 },
  springStiff: { type: 'spring', stiffness: 700, damping: 30 },
  smooth: { type: 'tween', duration: 0.3, ease: 'easeInOut' },
  slow: { type: 'tween', duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
} as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export const staggerContainer = (staggerDelay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.2,
    },
  },
});
```

```tsx
// _components/shared/animated-section.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fadeInUp' | 'fadeIn' | 'scaleIn';
}

const animations = {
  fadeInUp: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  animation = 'fadeInUp',
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      variants={animations[animation]}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

---

## Section Order (Proven Conversion Sequence)

| # | Section | Purpose | Key Element |
|---|---------|---------|-------------|
| 1 | **Hero** | Core value prop, primary CTA | Headline + visual + CTA |
| 2 | **Social Proof** | Immediate trust | Logos, user count, badges |
| 3 | **Problem** | Create empathy | Pain they recognize |
| 4 | **Features** | Show how you solve it | 3-4 features with visuals |
| 5 | **How It Works** | Reduce complexity | 3 steps: start → configure → benefit |
| 6 | **Testimonials** | Prove it works | 2-3 specific customer quotes |
| 7 | **Pricing** | Enable decision | Clear tiers, highlight recommended |
| 8 | **FAQ** | Handle objections | 5-7 common questions |
| 9 | **Final CTA** | Capture remainders | Repeat hero CTA with urgency |

---

## Hero Section Patterns

### The 5 Required Elements

| Element | Rule | Example |
|---------|------|---------|
| **Headline** | 6-12 words, states the outcome | "Ship docs in minutes, not days" |
| **Subheadline** | 15-25 words, expands on how | "AI-powered documentation that writes itself from your codebase." |
| **Hero visual** | Shows the OUTCOME, not the product | Person satisfied with results, not a UI screenshot |
| **Primary CTA** | Action verb + value | "Start Free Trial" not "Submit" or "Learn More" |
| **Social proof** | Logos, count, or micro-testimonial | "Trusted by 10,000+ teams" |

### Headline Formulas

| Formula | Example |
|---------|---------|
| [Outcome] without [pain] | "Beautiful docs without the design skills" |
| [Outcome] in [timeframe] | "Launch your site in 5 minutes" |
| The [better way] to [task] | "The faster way to build APIs" |
| Stop [pain]. Start [outcome]. | "Stop guessing. Start knowing." |

### Hero Animation Pattern

```tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export function Hero() {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        {/* gradient, image, or pattern */}
      </motion.div>

      <motion.div
        style={{ opacity: contentOpacity }}
        className="container mx-auto px-4"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
            Now available
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-5xl md:text-7xl font-bold tracking-tight"
        >
          Your headline here
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-xl text-muted-foreground max-w-2xl"
        >
          Supporting text that expands on the value proposition.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            Get Started Free
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 border rounded-lg font-medium"
          >
            See Demo
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by 10,000+ teams
          </p>
          <div className="flex gap-8 items-center opacity-50">
            {/* Company logos */}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

---

## Premium Animation Patterns

### Staggered Feature Grid
```tsx
<motion.div
  variants={staggerContainer(0.1)}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
  className="grid grid-cols-1 md:grid-cols-3 gap-8"
>
  {features.map((feature) => (
    <motion.div
      key={feature.title}
      variants={fadeInUp}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-6 rounded-2xl border bg-card"
    >
      {/* feature content */}
    </motion.div>
  ))}
</motion.div>
```

### Scroll Progress Bar
```tsx
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-0.5 bg-primary origin-left z-50"
    />
  );
}
```

### Text Reveal (Character-by-Character)
```tsx
export function TextReveal({ text }: { text: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span ref={ref} className="inline-block">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: i * 0.03 }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
```

### 3D Card Tilt on Hover
```tsx
export function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  function handleMouse(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}
```

### Marquee / Infinite Scroll Logos
```tsx
export function LogoMarquee({ logos }: { logos: string[] }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex gap-12 items-center"
      >
        {[...logos, ...logos].map((logo, i) => (
          <img key={i} src={logo} alt="" className="h-8 opacity-50" />
        ))}
      </motion.div>
    </div>
  );
}
```

---

## CTA Best Practices

| Good CTAs | Bad CTAs |
|-----------|----------|
| "Start Free Trial" | "Submit" |
| "Get Started Free" | "Click Here" |
| "See It in Action" | "Learn More" |
| "Try Free for 14 Days" | "Sign Up" |

**Formula:** Action verb + value/outcome + (optional: reduce risk)

---

## Performance Checklist

- [ ] Only animate `transform` and `opacity` (GPU-accelerated)
- [ ] `useInView` with `once: true` on scroll sections
- [ ] Lazy load images below the fold
- [ ] Hero image < 200KB
- [ ] Total page weight < 2MB
- [ ] LCP < 2.5s
- [ ] Reduced motion support via `useReducedMotion`
- [ ] All `motion.*` components are in `'use client'` files
- [ ] Server Component shell for the page, client components for animations

---

## Mobile Optimization

| Rule | Why |
|------|-----|
| CTA button full width on mobile | Easy thumb tap |
| Sticky CTA on scroll | Always accessible |
| Font minimum 16px | iOS zooms inputs below 16px |
| Tap targets minimum 48x48px | Apple/Google guidelines |
| Simplify animations on mobile | Performance + battery |
| Test on real devices | Simulators lie about perf |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hero is a product screenshot | Show the outcome, use lifestyle imagery |
| CTA says "Learn More" | Action verb + specific value |
| No scroll animations | Every section should animate in |
| Animations feel janky | Use springs, not linear tweens |
| Too many competing CTAs | One primary, one secondary max |
| No social proof | Add logos, counts, or testimonials |
| Sections too cramped | Minimum py-24, prefer py-32 |
| Desktop-only design | Design mobile-first |
| No reduced motion support | Always check `useReducedMotion` |
