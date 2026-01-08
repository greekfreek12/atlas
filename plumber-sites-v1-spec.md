# Plumber Sites V1 - Technical Specification

## Project Overview

Build a multi-tenant Next.js application that generates SEO-optimized websites for plumbing businesses. Each business gets a unique URL (`/[template]-[slug]`) with their information auto-populated from a Supabase database.

**Stack:**
- Next.js 14 (App Router)
- Supabase (Database + Auth for later)
- Tailwind CSS
- TypeScript

**Key Principle:** Mobile-first, but excellent on desktop.

---

## Template Variants

Create 3 distinct design templates. Each should feel genuinely different, not just color swaps.

### Template 1: `industrial`
- **Vibe:** Pipes, metal, blueprint-inspired, utilitarian
- **Colors:** Dark charcoal (#1a1a1a), steel gray (#4a5568), copper/brass accent (#b87333)
- **Typography:** 
  - Headlines: Something industrial/mechanical (e.g., "Oswald", "Bebas Neue", or "Industry")
  - Body: Clean sans-serif (e.g., "Source Sans Pro")
- **Elements:** Subtle pipe/wrench iconography, angular shapes, maybe subtle blueprint grid texture

### Template 2: `clean`
- **Vibe:** Professional, trustworthy, premium service
- **Colors:** Deep navy (#1e3a5f), white (#ffffff), light blue accent (#3b82f6)
- **Typography:**
  - Headlines: Strong serif (e.g., "Playfair Display") or bold sans (e.g., "Montserrat")
  - Body: Clean readable sans (e.g., "Inter" but use sparingly, or "DM Sans")
- **Elements:** Lots of whitespace, clean lines, subtle shadows, professional feel

### Template 3: `friendly`
- **Vibe:** Approachable, family-owned, local business you can trust
- **Colors:** Warm blue (#2563eb), cream/off-white (#faf7f2), warm accent (#f59e0b)
- **Typography:**
  - Headlines: Rounded, friendly (e.g., "Nunito", "Poppins")
  - Body: Same family or complementary
- **Elements:** Rounded corners, warmer feel, maybe subtle wave shapes

**CRITICAL DESIGN RULES (from frontend-design skill):**
- NO generic AI aesthetics: avoid overused purple gradients, excessive centered layouts, cookie-cutter patterns
- Typography matters: choose distinctive fonts, not Arial/Roboto defaults
- Create atmosphere: backgrounds shouldn't just be solid colors - use subtle textures, gradients, or patterns
- Motion: add micro-interactions on hover, subtle animations on scroll
- Each template should be MEMORABLE - someone should be able to tell them apart instantly

---

## URL Structure

```
/[template]-[slug]
```

Examples:
- `/industrial-joes-plumbing`
- `/clean-marco-plumbing`
- `/friendly-naples-plumbing-pros`

The template prefix determines which design to render. The slug identifies the business.

---

## Database Schema (Supabase)

Run this SQL in your Supabase project:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  template VARCHAR(50) DEFAULT 'clean',
  
  -- Basic info (from Outscraper)
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Location
  full_address TEXT,
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Google data
  google_rating DECIMAL(2, 1),
  google_reviews_count INTEGER,
  google_reviews_link TEXT,
  google_place_id VARCHAR(255),
  
  -- Hours (store as JSON)
  working_hours JSONB,
  
  -- Social links
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  
  -- Site customizations (can override defaults)
  custom_headline TEXT,
  custom_tagline TEXT,
  custom_about TEXT,
  primary_color VARCHAR(7),
  accent_color VARCHAR(7),
  
  -- Status
  status VARCHAR(50) DEFAULT 'prospect',
  is_published BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services offered (many per business)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page view tracking
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  page_path VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Raw Outscraper imports (keep all original data)
CREATE TABLE outscraper_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_data JSONB NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT false
);

-- Create indexes for common queries
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_page_views_business ON page_views(business_id);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_created ON page_views(created_at);

-- Default plumber services (insert after creating a business)
-- These will be cloned for each new business
CREATE TABLE default_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche VARCHAR(50) DEFAULT 'plumber',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

-- Insert default plumber services
INSERT INTO default_services (niche, name, description, icon, sort_order) VALUES
('plumber', 'Emergency Plumbing', 'Available 24/7 for burst pipes, severe leaks, and plumbing emergencies. Fast response when you need it most.', 'alert-triangle', 1),
('plumber', 'Drain Cleaning', 'Professional drain cleaning for clogged sinks, showers, and main sewer lines. We clear the toughest blockages.', 'droplets', 2),
('plumber', 'Water Heater Services', 'Installation, repair, and maintenance for tank and tankless water heaters. Hot water when you need it.', 'flame', 3),
('plumber', 'Leak Detection & Repair', 'Advanced leak detection to find hidden leaks before they cause major damage. Expert repairs that last.', 'search', 4),
('plumber', 'Fixture Installation', 'Professional installation of faucets, toilets, sinks, and showers. Quality workmanship guaranteed.', 'wrench', 5),
('plumber', 'Pipe Repair & Replacement', 'From minor pipe repairs to complete repiping. We work with all pipe materials and sizes.', 'cylinder', 6),
('plumber', 'Sewer Line Services', 'Sewer line inspection, cleaning, and repair. We diagnose and fix sewer problems fast.', 'arrow-down-circle', 7),
('plumber', 'Water Treatment', 'Water softeners, filtration systems, and water quality testing. Better water for your home.', 'droplet', 8);
```

---

## Project Structure

```
plumber-sites/
├── app/
│   ├── [templateSlug]/           # Dynamic route for all sites
│   │   ├── page.tsx              # Home page
│   │   ├── services/
│   │   │   └── page.tsx          # Services list
│   │   ├── about/
│   │   │   └── page.tsx          # About page
│   │   ├── contact/
│   │   │   └── page.tsx          # Contact page
│   │   ├── reviews/
│   │   │   └── page.tsx          # Reviews page
│   │   └── layout.tsx            # Shared layout (header, footer)
│   ├── api/
│   │   ├── contact/
│   │   │   └── route.ts          # Form submission endpoint
│   │   └── track/
│   │       └── route.ts          # Page view tracking endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/redirect (optional)
├── components/
│   ├── templates/
│   │   ├── industrial/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Reviews.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── index.ts
│   │   ├── clean/
│   │   │   └── ... (same components)
│   │   └── friendly/
│   │       └── ... (same components)
│   ├── shared/
│   │   ├── ContactForm.tsx       # Reusable form logic
│   │   ├── GoogleMap.tsx         # Embed map
│   │   ├── StarRating.tsx        # Display rating
│   │   ├── HoursDisplay.tsx      # Format hours
│   │   ├── PhoneLink.tsx         # Click-to-call
│   │   └── TrackingPixel.tsx     # Page view tracker
│   └── ui/
│       └── ... (buttons, cards, etc.)
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Helper functions
│   └── tracking.ts               # Tracking utilities
├── scripts/
│   └── import-outscraper.ts      # CSV import script
├── public/
│   ├── images/
│   │   ├── plumber-stock-1.jpg   # Stock photos for hero
│   │   ├── plumber-stock-2.jpg
│   │   └── ...
│   └── icons/
├── styles/
│   └── globals.css
├── .env.local                    # Supabase keys
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Page Specifications

### Home Page (`/[templateSlug]/page.tsx`)

**Sections (in order):**

1. **Header** (sticky)
   - Logo area (just business name styled nicely for V1)
   - Phone number (prominent, click-to-call)
   - Navigation: Services | About | Reviews | Contact
   - Mobile: hamburger menu

2. **Hero Section**
   - Headline: `{business.custom_headline || "{name} - Your Trusted Local Plumber"}`
   - Tagline: `{business.custom_tagline || "Proudly serving {city} and surrounding areas"}`
   - Two CTAs: "Call Now" (phone link) + "Get a Free Quote" (scroll to contact or link to /contact)
   - Background: Stock photo (NOT from Google) with overlay
   - Rating badge if they have Google reviews: "⭐ {rating} ({count} reviews)"

3. **Services Overview**
   - Grid of 4-6 service cards (from services table)
   - Icon + name + short description
   - "View All Services" link

4. **Why Choose Us**
   - 3-4 trust signals (licensed, insured, local, etc.)
   - These can be generic for V1

5. **Reviews Section**
   - Show rating prominently
   - "See our {count} reviews on Google" with link
   - Maybe 2-3 placeholder testimonial cards (generic for V1, can customize later)

6. **Contact CTA**
   - "Ready to get started?"
   - Phone number large
   - Hours display
   - Link to contact page

7. **Footer**
   - Business name, address, phone
   - Hours
   - Quick links
   - Social icons (if available)
   - "© 2025 {business name}"

---

### Services Page (`/[templateSlug]/services/page.tsx`)

- Hero: "Our Services" with business name
- Grid or list of ALL services from database
- Each service: icon, name, description
- CTA at bottom: "Need help? Call us"

---

### About Page (`/[templateSlug]/about/page.tsx`)

- Hero: "About {business name}"
- About text: `{business.custom_about || generic placeholder about local plumbing}`
- Trust signals: years in business, licensed, etc.
- Service area mention (city, state)
- CTA to contact

**Generic About Text (default):**
```
{name} has been proudly serving {city} and the surrounding {state} area with professional plumbing services. Our experienced team is committed to providing reliable, high-quality work at fair prices.

We understand that plumbing issues can be stressful, which is why we focus on clear communication, honest pricing, and getting the job done right the first time. Whether you need a simple repair or a complete installation, we're here to help.

Licensed, insured, and dedicated to customer satisfaction – that's the {name} difference.
```

---

### Reviews Page (`/[templateSlug]/reviews/page.tsx`)

- Hero: "What Our Customers Say"
- Large rating display with stars
- Review count
- Big CTA button: "Read Our Reviews on Google" → links to google_reviews_link
- Optional: Embed Google reviews widget (V2, requires API)

---

### Contact Page (`/[templateSlug]/contact/page.tsx`)

- Hero: "Contact Us"
- Two-column layout (stack on mobile):
  - Left: Contact form
  - Right: Contact info (phone, email, address, hours)
- Map embed below (Google Maps with lat/long)

**Contact Form Fields:**
- Name (required)
- Phone (required)
- Email (optional)
- Message (required)
- Submit button

**Form Behavior:**
1. Submit to `/api/contact`
2. Store in `form_submissions` table
3. Send email notification to you (use Resend or similar, or just log for V1)
4. Show success message

---

## Tracking Implementation

### TrackingPixel Component

Add this to the layout - it fires on every page load:

```tsx
// components/shared/TrackingPixel.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TrackingPixel({ businessId }: { businessId: string }) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);
    }
    
    // Track page view
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        sessionId,
        pagePath: pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      }),
    });
  }, [pathname, businessId]);
  
  return null;
}
```

### Track API Route

```tsx
// app/api/track/route.ts
import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const data = await request.json();
  
  await supabase.from('page_views').insert({
    business_id: data.businessId,
    session_id: data.sessionId,
    page_path: data.pagePath,
    referrer: data.referrer,
    user_agent: data.userAgent,
  });
  
  return NextResponse.json({ success: true });
}
```

---

## Outscraper Import Script

Create a script to import your CSV:

```typescript
// scripts/import-outscraper.ts
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function importCSV(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });
  
  for (const row of records) {
    // Store raw data
    await supabase.from('outscraper_imports').insert({
      raw_data: row,
    });
    
    // Create business record
    const slug = slugify(row.name);
    
    // Parse working hours JSON
    let workingHours = null;
    try {
      if (row.working_hours) {
        workingHours = JSON.parse(row.working_hours.replace(/'/g, '"'));
      }
    } catch (e) {
      console.log(`Could not parse hours for ${row.name}`);
    }
    
    const { error } = await supabase.from('businesses').insert({
      slug,
      name: row.name,
      phone: row.phone,
      email: row.email_1 || null,
      full_address: row.full_address,
      street: row.street,
      city: row.city,
      state: row.state,
      postal_code: row.postal_code?.toString(),
      latitude: parseFloat(row.latitude) || null,
      longitude: parseFloat(row.longitude) || null,
      google_rating: parseFloat(row.rating) || null,
      google_reviews_count: parseInt(row.reviews) || null,
      google_reviews_link: row.reviews_link,
      google_place_id: row.place_id,
      working_hours: workingHours,
      facebook_url: row.facebook || null,
      instagram_url: row.instagram || null,
      youtube_url: row.youtube || null,
      template: 'clean', // default template
    });
    
    if (error) {
      console.error(`Error inserting ${row.name}:`, error.message);
    } else {
      console.log(`Imported: ${row.name} → ${slug}`);
      
      // Clone default services for this business
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (business) {
        const { data: defaultServices } = await supabase
          .from('default_services')
          .select('*')
          .eq('niche', 'plumber');
        
        if (defaultServices) {
          for (const service of defaultServices) {
            await supabase.from('services').insert({
              business_id: business.id,
              name: service.name,
              description: service.description,
              icon: service.icon,
              sort_order: service.sort_order,
            });
          }
        }
      }
    }
  }
}

// Run with: npx ts-node scripts/import-outscraper.ts path/to/file.csv
importCSV(process.argv[2]);
```

---

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

---

## SEO Requirements

Each page needs:

1. **Dynamic metadata** (in page.tsx):
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const business = await getBusiness(params.templateSlug);
  return {
    title: `${business.name} | Plumber in ${business.city}, ${business.state}`,
    description: `Professional plumbing services in ${business.city}. Call ${business.phone} for emergency plumbing, drain cleaning, water heater repair & more.`,
  };
}
```

2. **JSON-LD Schema** (LocalBusiness):
```tsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "{business.name}",
  "telephone": "{business.phone}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{business.street}",
    "addressLocality": "{business.city}",
    "addressRegion": "{business.state}",
    "postalCode": "{business.postal_code}"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{business.latitude}",
    "longitude": "{business.longitude}"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{business.google_rating}",
    "reviewCount": "{business.google_reviews_count}"
  }
}
</script>
```

3. **Sitemap generation** (for V2 - after you have customers)

---

## Stock Photos

Include 3-4 high-quality stock photos in `/public/images/`:
- plumber-hero-1.jpg (plumber working, professional)
- plumber-hero-2.jpg (different angle/setting)
- plumber-tools.jpg (clean tools/workspace)
- plumber-team.jpg (if available)

Use Unsplash or Pexels for free options. Each template can use different hero images.

---

## Build Order (for Claude Code)

1. **Project setup** - Next.js, Tailwind, Supabase connection
2. **Database** - Run schema SQL in Supabase
3. **Types** - TypeScript types for Business, Service, etc.
4. **One template first** - Build `clean` template completely
5. **Dynamic routing** - Make `/[templateSlug]` work
6. **All pages** - Home, Services, About, Reviews, Contact
7. **Contact form** - API route + database storage
8. **Tracking** - TrackingPixel + API route
9. **Import script** - Get Outscraper data in
10. **Second template** - Build `industrial`
11. **Third template** - Build `friendly`
12. **Polish** - Animations, responsive fixes, SEO

---

## Notes for Claude Code

- Reference the **frontend-design skill** for design principles
- Each template should look DISTINCTLY different
- Mobile-first: design for phones, then enhance for desktop
- All text content should have sensible defaults that can be overridden
- Use Lucide icons (already included with shadcn)
- Keep components modular so templates can share logic but have different styling
- The `templateSlug` param format is `{template}-{slug}`, parse accordingly

---

## Questions Claude Code Should Ask You

1. Do you have Supabase project credentials ready?
2. Should I set up a specific email service for form notifications, or just log for now?
3. Any specific stock photos you want to use, or should I suggest some?
4. Do you want me to start with just one template and get it perfect first?
