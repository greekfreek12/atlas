---
description: Design principles for local service business websites on Atlas Sites
---

# Frontend Design for Atlas Sites

Design principles specifically tailored for local service businesses (plumbers, electricians, HVAC, contractors, etc.) that prioritize lead generation and trust-building.

## Core Principles

### 1. Trust-First Design
Local service businesses need to establish credibility immediately. Every design choice should reinforce trustworthiness.

**Visual Trust Signals:**
- Clean, professional layouts (no cluttered pages)
- High-quality imagery showing real work, not stock photos
- Visible certifications, licenses, and insurance badges
- Customer review ratings prominently displayed
- Years in business, number of customers served

### 2. Conversion-Focused Layout
The primary goal is generating phone calls and form submissions.

**Above the Fold:**
- Phone number: LARGE, clickable, always visible
- Clear headline stating what you do and where
- Primary CTA button that stands out
- Trust badges (Licensed, Insured, etc.)

**Section Flow:**
1. Hero → Immediate value proposition
2. Trust Bar → Credibility boosters
3. Services → What you offer
4. Reviews → Social proof
5. CTA → Conversion opportunity
6. Contact → Lead capture

### 3. Mobile-First Performance
70%+ of traffic for local services comes from mobile devices.

**Mobile Requirements:**
- Tap-to-call phone links
- Large touch targets (44px minimum)
- Fast load times (images optimized)
- Sticky header with phone number
- Simple, single-column layouts

## Color Guidelines

### Primary Colors (By Trade)
Choose colors that convey the right emotion:

| Trade | Recommended | Reasoning |
|-------|-------------|-----------|
| Plumbing | Blues, Teals | Water, trust, reliability |
| Electrical | Oranges, Yellows | Energy, alertness, safety |
| HVAC | Blues, Greens | Comfort, air, freshness |
| Roofing | Browns, Oranges | Earth, durability, warmth |
| General Contractor | Navy, Grays | Professionalism, stability |

### Accent Colors for CTAs
- **High contrast is essential** - CTAs must pop
- Orange/Yellow on dark backgrounds
- Dark blue/Green on light backgrounds
- Never use muted or pastel accents for primary CTAs

### What to Avoid
- Pastels (look unserious for trade businesses)
- Neon colors (look unprofessional)
- Too many colors (stick to 2-3 max)
- Low contrast combinations

## Typography Guidelines

### Headlines
- **Font choices:** Outfit, Poppins, Inter, Montserrat
- **Weight:** Bold (600-800)
- **Size:** Large and commanding (2.5-4rem mobile, larger desktop)
- **Style:** Sans-serif for modern, trustworthy feel

### Body Text
- **Font choices:** Inter, Open Sans, Nunito Sans
- **Size:** 16px minimum (18px preferred)
- **Line height:** 1.5-1.7 for readability
- **Color:** Not pure black (#333 or similar)

### Phone Numbers
- Large (24px+ mobile)
- Bold weight
- High contrast color
- Clickable with tel: links

## Layout Patterns

### Hero Section
```
[Navigation with Logo + Phone]
[Full-width Hero Image with Overlay]
  - Headline (2 lines max)
  - Tagline (1 line)
  - Primary CTA Button
  - Optional: Secondary CTA
  - Trust badges (3-4 max)
```

### Trust Bar
- Dark background for contrast
- 3-5 trust points with icons
- Short, scannable text
- Can include: Licensed, Insured, 24/7, Family Owned, Years in Business

### Services Grid
- 3 columns desktop, 1 column mobile
- Card-based layout
- Image or icon + title + brief description
- Consistent card heights

### Reviews Section
- Show Google rating prominently
- 3-5 featured reviews
- Carousel for mobile, grid for desktop
- Include customer name and location

## Section Styling

### Padding
- Generous vertical padding (80-120px desktop)
- Consistent across sections
- Reduced on mobile (40-60px)

### Backgrounds
- Alternate between light and dark/accent sections
- Use subtle patterns or gradients sparingly
- Image backgrounds need 60-80% dark overlay for text

### Borders & Shadows
- Subtle shadows for cards (not harsh drop shadows)
- Border radius: 8-16px for modern feel
- Avoid sharp corners on interactive elements

## Accessibility Requirements

- **Contrast:** 4.5:1 minimum for body text, 3:1 for large text
- **Focus states:** Visible keyboard focus indicators
- **Alt text:** All images must have descriptive alt text
- **Touch targets:** 44x44px minimum for interactive elements
- **Font sizes:** Never below 16px for body text

## Image Guidelines

### Hero Images
- Professional quality photos
- Show real work or team (not stock)
- High resolution (1920px+ width)
- Compress for web (WebP preferred)

### Service Images
- Consistent aspect ratios (16:9 or 4:3)
- Relevant to the specific service
- Before/after shots work well

### Alt Text Examples
- Good: "Orleans Plumbing technician repairing kitchen sink"
- Bad: "plumber" or "image1"

## Performance Optimization

- Use system fonts when possible
- Lazy load images below the fold
- Optimize images to WebP format
- Minimize JavaScript
- Target < 3 second load time
