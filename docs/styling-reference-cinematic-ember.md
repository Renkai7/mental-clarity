# Cinematic Ember Style Reference

**Version:** 1.0  
**Last Updated:** November 29, 2025  
**Purpose:** A comprehensive styling guide for replicating the Cinematic Ember aesthetic in any project.

---

## Overview

The **Cinematic Ember** style is a dark, high-contrast design system inspired by cinematic UI and warm accent colors. It combines deep blacks with vibrant orange/amber glows, glass-morphism effects, and subtle animations to create a premium, immersive experience.

**Key Characteristics:**
- Ultra-dark backgrounds with subtle gradients
- OKLCH color space for consistent luminance
- Warm orange/amber accent colors (Lumina palette)
- Glass-morphism with backdrop blur
- Glow shadows for depth and hierarchy
- Gentle floating animations and entrance effects
- Minimal texture overlays (grid patterns)

---

## Color Palette

### Background Colors

Use OKLCH color space for precise luminance control:

```css
/* Base blacks */
--color-cinematic-black: #000000;
--color-cinematic-950: oklch(0.08 0 0);   /* Near-black, 8% luminance */
--color-cinematic-900: oklch(0.12 0 0);   /* Very dark gray, 12% luminance */
--color-cinematic-800: oklch(0.16 0 0);   /* Dark gray, 16% luminance */
```

**Usage:**
- **Cinematic Black (`#000000`):** Page backgrounds, fixed overlays
- **Cinematic 950:** Card backgrounds, elevated surfaces
- **Cinematic 900:** Slightly elevated surfaces, hover states
- **Cinematic 800:** Borders, dividers, subtle accents

### Accent Colors

Warm orange/amber palette (Lumina):

```css
/* Orange accents */
--color-lumina-orange-600: oklch(0.65 0.18 45);  /* Darker orange */
--color-lumina-orange-500: oklch(0.70 0.20 45);  /* Primary orange */
--color-lumina-orange-400: oklch(0.75 0.18 45);  /* Lighter orange */

/* Amber accents */
--color-lumina-amber-600: oklch(0.68 0.16 60);   /* Darker amber */
--color-lumina-amber-500: oklch(0.73 0.18 60);   /* Primary amber */
--color-lumina-amber-400: oklch(0.78 0.16 60);   /* Lighter amber */
```

**Usage:**
- **Orange:** Primary CTAs, key metrics, high-priority elements
- **Amber:** Secondary accents, supporting stats, variety in UI

### Text Colors

```css
--color-text-primary: #ffffff;           /* Headings, important labels */
--color-text-secondary: rgb(148 163 184); /* Body text, descriptions (slate-400) */
--color-text-muted: rgb(100 116 139);    /* Disabled, tertiary text (slate-500) */
```

**Hierarchy:**
- **White:** Headings, numeric values, primary labels
- **Slate-400:** Descriptions, secondary labels, body copy
- **Slate-500:** Captions, metadata, disabled states

---

## Typography

### Headline Styles

```css
/* Large hero headline */
.hero-headline {
  font-size: 3.75rem; /* text-6xl */
  font-weight: 800;   /* font-extrabold */
  letter-spacing: -0.025em; /* tracking-tight */
  background: linear-gradient(to right, #ffffff, rgb(226 232 240), oklch(0.75 0.18 45));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Section title */
.section-title {
  font-size: 1.875rem; /* text-3xl */
  font-weight: 700;    /* font-bold */
  color: #ffffff;
}

/* Card title */
.card-title {
  font-size: 0.875rem; /* text-sm */
  font-weight: 600;    /* font-semibold */
  color: rgb(203 213 225); /* slate-300 */
}
```

### Body Text

```css
/* Large body text (hero subtitle) */
.body-large {
  font-size: 1.25rem; /* text-xl */
  line-height: 1.75rem;
  color: rgb(148 163 184); /* slate-400 */
}

/* Base body text */
.body-base {
  font-size: 1rem; /* text-base */
  line-height: 1.5rem;
  color: rgb(148 163 184); /* slate-400 */
}

/* Small text (captions, metadata) */
.body-small {
  font-size: 0.875rem; /* text-sm */
  color: rgb(148 163 184); /* slate-400 */
}
```

### Numeric Display

```css
/* Large metric value (stat cards) */
.metric-large {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 800;   /* font-extrabold */
  color: #ffffff;
}

/* Bold numeric value (table cells) */
.metric-bold {
  font-weight: 700; /* font-bold */
  color: #ffffff;
}
```

**Typography Do's:**
- ✅ Use gradient text for hero headlines only
- ✅ Keep body text at slate-400 for comfortable reading
- ✅ Use extrabold (800) for large metrics to emphasize data
- ✅ Apply tracking-tight to large headlines for better density

**Typography Don'ts:**
- ❌ Don't use gradient text on body copy (readability issues)
- ❌ Don't mix multiple text gradients on the same screen
- ❌ Don't use pure white for body text (too harsh on dark backgrounds)
- ❌ Don't go below 0.875rem (text-sm) for accessibility

---

## Card Styles

### Glass-Morphism Cards

The signature Ember card style uses backdrop blur, semi-transparent backgrounds, and accent glows:

```css
.ember-card {
  backdrop-filter: blur(12px);              /* backdrop-blur-xl */
  background-color: oklch(0.12 0 0 / 0.4);  /* bg-cinematic-900/40 */
  border: 2px solid oklch(0.16 0 0);        /* border-cinematic-800 */
  border-radius: 0.75rem;                   /* rounded-lg */
  box-shadow: 0 0 20px oklch(0.70 0.20 45 / 0.4), 
              0 0 40px oklch(0.70 0.20 45 / 0.2); /* shadow-glow-orange */
  position: relative;
  overflow: hidden;
}

/* Gradient overlay for accent */
.ember-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, 
                oklch(0.65 0.18 45 / 0.1), 
                transparent);
  pointer-events: none;
  z-index: 0;
}
```

### Stat Cards

```css
.stat-card {
  /* Base card styles (same as above) */
  padding: 1.5rem; /* p-6 */
  cursor: pointer;
}

.stat-card:hover {
  box-shadow: 0 0 30px oklch(0.70 0.20 45 / 0.5), 
              0 0 60px oklch(0.70 0.20 45 / 0.3); /* hover:shadow-glow-orange-lg */
  transform: scale(1.05); /* hover:scale-105 */
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-card-icon {
  width: 1.5rem;  /* h-6 */
  height: 1.5rem; /* w-6 */
  color: oklch(0.70 0.20 45); /* text-lumina-orange-500 */
}

.stat-card-value {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 800;   /* font-extrabold */
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.stat-card-delta {
  font-size: 0.875rem; /* text-sm */
  color: oklch(0.73 0.18 60); /* text-lumina-amber-400 */
}
```

### Table Containers

```css
.table-container {
  /* Base card styles */
  backdrop-filter: blur(12px);
  background-color: oklch(0.12 0 0 / 0.4);
  border: 2px solid oklch(0.16 0 0);
  box-shadow: 0 0 20px oklch(0.70 0.20 45 / 0.4), 
              0 0 40px oklch(0.70 0.20 45 / 0.2);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem; /* p-6 */
  position: relative;
  z-index: 10;
}

.table-title {
  font-size: 1.875rem; /* text-3xl */
  font-weight: 700;    /* font-bold */
  color: #ffffff;
}

.table-description {
  font-size: 1rem; /* text-base */
  color: rgb(148 163 184); /* text-slate-400 */
  margin-top: 0.5rem;
}
```

### Table Styling

```css
/* Table header row */
.table-header-row {
  border-bottom: 2px solid oklch(0.65 0.18 45 / 0.3); /* border-lumina-orange-600/30 */
}

.table-header-row:hover {
  background: transparent; /* Disable hover on header */
}

.table-header-cell {
  font-weight: 600;  /* font-semibold */
  font-size: 1rem;   /* text-base */
  color: rgb(203 213 225); /* text-slate-300 */
  background-color: oklch(0.08 0 0 / 0.8); /* bg-cinematic-950/80 */
}

/* Table body rows */
.table-body-row {
  border-bottom: 1px solid oklch(0.16 0 0 / 0.4); /* border-cinematic-800/40 */
  cursor: pointer;
  transition: all 150ms;
}

.table-body-row:hover {
  background-color: oklch(0.12 0 0 / 0.6); /* hover:bg-cinematic-900/60 */
  box-shadow: 0 0 20px oklch(0.70 0.20 45 / 0.3); /* hover:shadow-glow-orange/30 */
}

.table-cell {
  font-size: 1rem; /* text-base */
  padding: 1rem 0; /* py-4 */
}

.table-cell-primary {
  font-weight: 600; /* font-semibold */
  color: #ffffff;
}

.table-cell-secondary {
  color: rgb(148 163 184); /* text-slate-400 */
}

.table-cell-numeric {
  text-align: right;
  font-weight: 700; /* font-bold */
  color: #ffffff;
}
```

### Badges

```css
.ember-badge {
  backdrop-filter: blur(4px);  /* backdrop-blur-sm */
  background-color: rgb(255 255 255 / 0.1); /* bg-white/10 */
  border: 1px solid oklch(0.70 0.20 45 / 0.3); /* border-lumina-orange-500/30 */
  color: oklch(0.75 0.18 45); /* text-lumina-orange-400 */
  font-weight: 600;  /* font-semibold */
  padding: 0.25rem 0.75rem; /* px-3 py-1 */
  border-radius: 0.375rem; /* rounded-md */
}

.ember-badge:hover {
  transform: scale(1.1);      /* hover:scale-110 */
  filter: brightness(1.1);    /* hover:brightness-110 */
}
```

**Card Style Do's:**
- ✅ Always use backdrop-blur-xl for glass-morphism depth
- ✅ Layer content with `position: relative; z-index: 10` above gradient overlays
- ✅ Use 2px borders for clear boundaries against dark backgrounds
- ✅ Apply glow shadows to establish hierarchy (brighter = more important)

**Card Style Don'ts:**
- ❌ Don't use solid backgrounds (breaks glass effect)
- ❌ Don't omit the gradient overlay (adds depth and accent color)
- ❌ Don't use sharp corners (rounded-lg minimum)
- ❌ Don't stack multiple glows of the same color without spacing

---

## Background Rules

### Base Layer

```css
.page-background {
  background: 
    /* Primary radial glow (top center) */
    radial-gradient(circle at 50% 20%, 
      oklch(0.45 0.15 45 / 0.3) 0%, 
      oklch(0.25 0.10 45 / 0.15) 25%,
      oklch(0.15 0.05 45 / 0.05) 50%,
      transparent 80%
    ),
    /* Secondary radial glow (bottom right) */
    radial-gradient(circle at 80% 70%, 
      oklch(0.48 0.13 60 / 0.25) 0%, 
      oklch(0.25 0.08 60 / 0.10) 30%,
      transparent 60%
    ),
    /* Base gradient (subtle purple tint) */
    linear-gradient(180deg, 
      oklch(0.15 0.02 280) 0%, 
      oklch(0.10 0.01 280) 50%,
      oklch(0.08 0.01 280) 100%
    );
  
  position: fixed;
  inset: 0;
  z-index: -20;
}
```

### Grid Overlay

```css
.grid-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: 
    linear-gradient(to right, rgb(255 255 255 / 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.1) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
}
```

### Animated Background Elements

```css
/* Pulsing glow spot */
.glow-spot {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, oklch(0.70 0.20 45 / 0.3) 0%, transparent 70%);
  filter: blur(60px);
  opacity: 0.3;
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Floating orb */
.floating-orb {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, oklch(0.70 0.20 45 / 0.4) 0%, transparent 60%);
  filter: blur(40px);
  opacity: 0.1;
  animation: float-gentle 8s ease-in-out infinite;
}

@keyframes float-gentle {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(20px, -15px); }
  50% { transform: translate(-10px, -25px); }
  75% { transform: translate(-15px, 10px); }
}

/* Shooting star */
.shooting-star {
  position: absolute;
  width: 3px;
  height: 40px;
  background: linear-gradient(to bottom, oklch(0.75 0.18 45), transparent);
  filter: blur(1px);
  opacity: 0.4;
  animation: shooting-star 3s ease-in-out infinite;
}

@keyframes shooting-star {
  0% { transform: translate(0, 0); opacity: 0; }
  10% { opacity: 0.4; }
  50% { transform: translate(100px, 100px); opacity: 0.2; }
  100% { transform: translate(200px, 200px); opacity: 0; }
}

/* Drifting orb (circular motion) */
.drifting-orb {
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, oklch(0.70 0.20 45 / 0.5) 0%, transparent 70%);
  filter: blur(30px);
  opacity: 0.1;
  animation: drift-orb 8s ease-in-out infinite;
}

@keyframes drift-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -20px) scale(1.1); }
  50% { transform: translate(50px, 10px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(1.05); }
}
```

**Background Layering (back to front):**
1. **Fixed base gradients** (`z-index: -20`)
2. **Grid overlay** (`z-index: -10`, `opacity: 0.03`)
3. **Pulsing glow spots** (`z-index: -10`, `opacity: 0.2-0.3`)
4. **Floating orbs** (`z-index: -10`, `opacity: 0.1`)
5. **Shooting stars** (`z-index: -10`, `opacity: 0.25-0.4`)
6. **Drifting orbs** (`z-index: -10`, `opacity: 0.07-0.1`)
7. **Content layer** (`z-index: 10+`)

**Background Do's:**
- ✅ Keep all background elements at `z-index: -10` or lower
- ✅ Use `pointer-events: none` to prevent interaction
- ✅ Keep opacity low (0.03-0.3) to avoid overpowering content
- ✅ Stagger animation delays for visual variety

**Background Don'ts:**
- ❌ Don't use more than 2 radial gradients in the base layer
- ❌ Don't set blur values above 80px (performance impact)
- ❌ Don't animate more than 8-10 elements simultaneously
- ❌ Don't use opacity above 0.5 for background glows

---

## Motion Guidelines

### Entrance Animations

```css
/* Fade-in-up (staggered entrance) */
.entrance-fade-up {
  animation: fade-in-up 0.6s ease-out;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger delays for sequential elements */
.entrance-delay-0 { animation-delay: 0s; }
.entrance-delay-1 { animation-delay: 0.2s; }
.entrance-delay-2 { animation-delay: 0.4s; }
.entrance-delay-3 { animation-delay: 0.6s; }
.entrance-delay-4 { animation-delay: 0.8s; }
```

**With Framer Motion (preferred):**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
>
  {/* Content */}
</motion.div>
```

### Hover Animations

```css
/* Scale + glow enhancement (stat cards, buttons) */
.hover-scale {
  transition: all 300ms ease-out;
}

.hover-scale:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px oklch(0.70 0.20 45 / 0.5), 
              0 0 60px oklch(0.70 0.20 45 / 0.3);
}

/* Brightness boost (badges, small elements) */
.hover-brightness {
  transition: all 200ms ease-out;
}

.hover-brightness:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

/* Background shift (table rows) */
.hover-bg-shift {
  transition: all 150ms ease-out;
}

.hover-bg-shift:hover {
  background-color: oklch(0.12 0 0 / 0.6);
  box-shadow: 0 0 20px oklch(0.70 0.20 45 / 0.3);
}
```

### Transition Durations

```css
/* Fast interactions (badges, small buttons) */
--duration-fast: 150ms;

/* Normal interactions (cards, table rows) */
--duration-normal: 200ms;

/* Slow interactions (large cards, modals) */
--duration-slow: 300ms;

/* Entrance animations (initial page load) */
--duration-entrance: 600ms;
```

**Timing Functions:**
- **ease-out:** Entrance animations, scale-ups
- **ease-in-out:** Continuous loops (pulse, float)
- **cubic-bezier(0.4, 0, 0.6, 1):** Subtle pulsing effects

**Motion Do's:**
- ✅ Stagger entrance animations by 0.2s increments
- ✅ Use 0.6s duration for entrance animations
- ✅ Keep hover transitions under 300ms
- ✅ Apply `cursor: pointer` to interactive elements

**Motion Don'ts:**
- ❌ Don't animate all elements simultaneously (overwhelming)
- ❌ Don't use durations longer than 1s for interactions
- ❌ Don't scale elements beyond 1.1x (too dramatic)
- ❌ Don't forget `prefers-reduced-motion` media query

---

## Shadow System

### Glow Shadows

```css
/* Orange glow (primary) */
--shadow-glow-orange: 0 0 20px oklch(0.70 0.20 45 / 0.4), 
                      0 0 40px oklch(0.70 0.20 45 / 0.2);

--shadow-glow-orange-lg: 0 0 30px oklch(0.70 0.20 45 / 0.5), 
                          0 0 60px oklch(0.70 0.20 45 / 0.3);

/* Amber glow (secondary) */
--shadow-glow-amber: 0 0 20px oklch(0.73 0.18 60 / 0.4), 
                     0 0 40px oklch(0.73 0.18 60 / 0.2);

--shadow-glow-amber-lg: 0 0 30px oklch(0.73 0.18 60 / 0.5), 
                         0 0 60px oklch(0.73 0.18 60 / 0.3);
```

**Usage Hierarchy:**
- **Large Glow (`-lg`):** Hover states, primary CTAs, high-priority cards
- **Base Glow:** Default cards, table containers, elevated surfaces
- **Small Glow (0.3 opacity):** Subtle accents, table row hovers

**Shadow Do's:**
- ✅ Use orange glow for primary elements (CTAs, key metrics)
- ✅ Use amber glow for secondary elements (supporting stats)
- ✅ Layer 2 shadows (near + far) for realistic depth
- ✅ Increase glow on hover for feedback

**Shadow Don'ts:**
- ❌ Don't use more than 2 glow colors per screen
- ❌ Don't apply glows to body text or small elements
- ❌ Don't set opacity above 0.5 (too intense)
- ❌ Don't forget to pair glows with accent colors

---

## Component Patterns

### Primary CTA Button

```tsx
<button className="
  px-8 py-4 
  bg-gradient-to-r from-lumina-orange-600 to-lumina-orange-500 
  text-white font-bold text-lg 
  rounded-xl 
  shadow-glow-orange hover:shadow-glow-orange-lg 
  hover:scale-105 hover:brightness-110 
  transition-all duration-300 
  cursor-pointer
">
  View Full Report
</button>
```

### Hero Section

```tsx
<div className="py-16 space-y-6 text-center">
  <motion.h1 
    className="text-6xl font-extrabold tracking-tight 
               bg-gradient-to-r from-white via-slate-100 to-lumina-orange-400 
               bg-clip-text text-transparent"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    Dashboard
  </motion.h1>
  <motion.p 
    className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
  >
    Welcome back! Here's an overview of your key metrics.
  </motion.p>
</div>
```

### Stat Grid

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat, index) => (
    <motion.div
      key={stat.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 + (index * 0.1), ease: "easeOut" }}
    >
      <StatCard {...stat} />
    </motion.div>
  ))}
</div>
```

---

## Do's and Don'ts Summary

### ✅ Do's

**Colors:**
- Use OKLCH color space for all custom colors (consistent luminance)
- Alternate orange and amber accents for visual variety
- Keep text at slate-400 or higher for readability

**Typography:**
- Apply gradient text to hero headlines only
- Use extrabold (800) for large numeric values
- Maintain hierarchy: white > slate-300 > slate-400 > slate-500

**Cards:**
- Always pair backdrop blur with semi-transparent backgrounds
- Layer content above gradient overlays with relative z-index
- Use 2px borders for clear definition

**Backgrounds:**
- Keep animated elements at z-index -10 or lower
- Set opacity low (0.03-0.3) to avoid overpowering content
- Use pointer-events: none on all decorative layers

**Motion:**
- Stagger entrance animations by 0.2s for sequential elements
- Keep hover transitions under 300ms for responsiveness
- Always provide cursor: pointer on interactive elements

### ❌ Don'ts

**Colors:**
- Don't use pure white for body text (too harsh)
- Don't mix more than 2 accent colors per screen
- Don't use hex colors for custom values (breaks luminance consistency)

**Typography:**
- Don't apply gradient text to body copy or small text
- Don't use font sizes below 0.875rem (14px)
- Don't use more than one gradient text element per section

**Cards:**
- Don't use solid backgrounds (ruins glass-morphism)
- Don't omit gradient overlays (loses depth)
- Don't use sharp corners (minimum rounded-lg)

**Backgrounds:**
- Don't animate more than 8-10 elements simultaneously
- Don't use blur values above 80px (performance cost)
- Don't set glow opacity above 0.5 (too bright)

**Motion:**
- Don't animate all elements at once (overwhelming)
- Don't use transition durations over 1s for interactions
- Don't scale elements beyond 1.1x (too dramatic)
- Don't forget prefers-reduced-motion support

---

## Implementation Checklist

When applying Cinematic Ember to a new project:

1. **Setup Phase:**
   - [ ] Add OKLCH color tokens to CSS/Tailwind config
   - [ ] Define glow shadow utilities
   - [ ] Import animation keyframes (pulse-slow, float-gentle, shooting-star, drift-orb)
   - [ ] Set up backdrop-blur utilities

2. **Background Phase:**
   - [ ] Create fixed base layer with radial gradients
   - [ ] Add grid overlay at 0.03 opacity
   - [ ] Position 2-4 pulsing glow spots with staggered delays
   - [ ] Add 2-3 floating orbs with gentle animation
   - [ ] Place 3-4 shooting stars with varied delays
   - [ ] Include 2-3 drifting orbs for subtle motion

3. **Component Phase:**
   - [ ] Build hero section with gradient headline
   - [ ] Create primary CTA button with glow shadow
   - [ ] Design stat cards with glass-morphism
   - [ ] Style table container with elevated header
   - [ ] Apply hover states (scale, brightness, background shift)

4. **Animation Phase:**
   - [ ] Add entrance animations with Framer Motion or CSS
   - [ ] Stagger delays by 0.2s for sequential elements
   - [ ] Test hover transitions (should be under 300ms)
   - [ ] Verify prefers-reduced-motion support

5. **Polish Phase:**
   - [ ] Check color contrast (WCAG AA minimum)
   - [ ] Test on dark displays (glows shouldn't be too bright)
   - [ ] Verify performance (aim for 60fps animations)
   - [ ] Validate responsive behavior on mobile

---

## Accessibility Notes

- **Contrast Ratios:** White text on cinematic-900 meets WCAG AA (4.5:1+)
- **Motion:** Always provide `prefers-reduced-motion` fallbacks
- **Focus States:** Add visible focus rings with orange/amber accent
- **Keyboard Navigation:** Ensure all interactive elements are keyboard accessible

```css
/* Focus ring example */
.focusable:focus-visible {
  outline: 2px solid oklch(0.70 0.20 45);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Structure (Recommended)

```
/ui/cinematic-ember/
  theme.ts                  # Color tokens, shadows, gradients
  BackgroundEffects.tsx     # Animated background component
  EmberShell.tsx            # Layout wrapper with background
  EmberCard.tsx             # Glass-morphism card wrapper
  EmberCTAButton.tsx        # Primary button component
  EmberStatCard.tsx         # Stat display card
  EmberTableContainer.tsx   # Table wrapper with header
  index.ts                  # Barrel exports

/app/globals.css
  # Tailwind config + custom animations + color tokens
```

---

## Version History

**v1.0 (November 29, 2025):**
- Initial release
- Extracted from dashboard-shell implementation
- Includes all color, typography, card, background, and motion patterns

---

**End of Document**

For questions or contributions, refer to the original implementation in `/app/dashboard-shell/page.tsx` and `/ui/cinematic-ember/`.
