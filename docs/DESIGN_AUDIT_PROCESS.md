# Design Audit & Website-Wide Consistency Process

A systematic approach for design audits and consistency improvements across the entire Sovra marketing website.

## When to Use This Process

Use this process when:
- Running a design audit across the website
- Implementing new design utilities/patterns across all pages
- Ensuring consistency after major design changes
- Updating typography, backgrounds, or visual effects site-wide
- Adding new CSS utilities that should apply everywhere

**Important:** Always plan before executing. Complete the inventory checklist first, create a tracking plan, then implement systematically.

---

## Phase 1: Pre-Audit Inventory

Before making any changes, document every element that needs attention.

### 1.1 Pages Inventory

| Page | Path | Priority | Notes |
|------|------|----------|-------|
| Landing | `/[locale]/page.tsx` | High | Uses section components |
| SovraGov | `/[locale]/sovragov/page.tsx` | High | Product page |
| SovraID | `/[locale]/sovraid/page.tsx` | High | Product page |
| SovraWallet | `/[locale]/sovrawallet/page.tsx` | High | Product page |
| SovraChain | `/[locale]/sovrachain/page.tsx` | High | Product page |
| Demo | `/[locale]/demo/page.tsx` | High | Interactive experience |
| Newsroom | `/[locale]/newsroom/page.tsx` | High | Timeline + social CTA buttons |
| Use Cases | `/[locale]/use-cases/[category]/page.tsx` | High | 8 category pages |
| About | `/[locale]/about/page.tsx` | Medium | Content page |
| Case Studies | `/[locale]/case-studies/page.tsx` | Medium | Content page |
| Manifesto | `/[locale]/manifesto/page.tsx` | Medium | Content page |
| Knowledge | `/[locale]/knowledge/page.tsx` | Medium | Long-form content |
| Partners | `/[locale]/partners/page.tsx` | Medium | Content page |
| Partners Portal | `/[locale]/partners/portal/page.tsx` | Medium | Interactive |
| FAQ | `/[locale]/faq/page.tsx` | Medium | Q&A with categories |
| Terms | `/[locale]/terms/page.tsx` | Low | Legal content |
| Privacy | `/[locale]/privacy/page.tsx` | Low | Legal content |

### 1.2 Landing Page Sections Inventory

| Component | Path | Elements to Check |
|-----------|------|-------------------|
| Hero | `components/sections/Hero.tsx` | h1, badges, backgrounds, animations |
| Products | `components/sections/Products.tsx` | cards, h2/h3, hover effects |
| UseCases | `components/sections/UseCases.tsx` | tabs, content, backgrounds |
| Journeys | `components/sections/Journeys.tsx` | cards, modals, badges |
| Testimonials | `components/sections/Testimonials.tsx` | quotes, cards, backgrounds |
| Regions | `components/sections/Regions.tsx` | map, cards, stats |
| FAQ | `components/sections/FAQ.tsx` | accordion, backgrounds |
| CTA | `components/sections/CTA.tsx` | h2, buttons, backgrounds |

### 1.3 Layout Components Inventory

| Component | Path | Elements to Check |
|-----------|------|-------------------|
| Header | `components/layout/Header.tsx` | nav, dropdowns, mobile menu |
| Footer | `components/layout/Footer.tsx` | links, backgrounds, borders |

### 1.4 UI Components Inventory

| Component | Path | Elements to Check |
|-----------|------|-------------------|
| Button | `components/ui/Button.tsx` | variants, hover states |
| Accordion | `components/ui/Accordion.tsx` | expand/collapse, backgrounds |
| Container | `components/ui/Container.tsx` | max-width, padding |
| ContactModal | `components/ui/ContactModal.tsx` | form, backgrounds, typography |

### 1.5 Modals & Overlays Inventory

Check for modals within pages:
- [ ] Demo page task flow modal
- [ ] Demo page QR modal
- [ ] Partners Portal QR modal
- [ ] Journeys section credential modals
- [ ] Contact modal (global)

---

## Phase 2: Design System Reference

### 2.1 Typography Standards

```
Hero h1:     text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-[0.95]
Section h2:  text-4xl md:text-5xl font-bold font-display
Card h3:     text-xl md:text-2xl font-bold font-display
Badges:      text-xs font-semibold uppercase tracking-wider
Body:        text-neutral (inherits base size)
```

### 2.2 Background Utilities

```css
/* Hero sections */
.noise-overlay         /* Subtle noise texture */
.gradient-mesh-primary /* Colorful gradient mesh */

/* Feature sections */
.gradient-mesh-subtle  /* Muted gradient mesh */
.grid-pattern          /* Geometric grid background */

/* Section transitions */
.section-fade-top      /* Gradient fade from top */
.section-fade-bottom   /* Gradient fade from bottom */
```

### 2.3 Interactive Utilities

```css
/* Cards */
.card-hover-gradient   /* Gradient reveal + lift on hover */

/* Buttons */
.btn-glow-pulse        /* Pulsing glow animation on hover */

/* Text */
.text-gradient-animated /* Animated gradient text */
```

### 2.4 Standard Section Pattern

```tsx
<section className="py-24 bg-dark-surface relative overflow-hidden section-fade-top">
  <div className="absolute inset-0 grid-pattern opacity-20" />
  <div className="absolute inset-0 gradient-mesh-subtle" />
  <Container className="relative z-10">
    {/* Content */}
  </Container>
</section>
```

### 2.5 Standard Card Pattern

```tsx
<div className="bg-dark-surface rounded-2xl p-6 border border-white/5 card-hover-gradient">
  {/* Card content */}
</div>
```

---

## Phase 3: Audit Checklist Template

Use this checklist for each page. Copy and fill out for tracking.

### Page: [Page Name]

**File:** `src/app/[locale]/[page]/page.tsx`

#### Typography
- [ ] All h1 use `font-display`
- [ ] All h2 use `font-display`
- [ ] All h3 use `font-display`
- [ ] Badges use `text-xs font-semibold uppercase tracking-wider`
- [ ] Hero h1 uses `leading-[0.95]`

#### Hero Section
- [ ] Has `noise-overlay` class
- [ ] Has `gradient-mesh-primary` background
- [ ] Badge styling matches standard

#### Content Sections
- [ ] Each section has `relative overflow-hidden`
- [ ] Appropriate sections have `grid-pattern`
- [ ] Sections use `section-fade-top` or `section-fade-bottom` where appropriate
- [ ] Alternating `bg-dark-bg` / `bg-dark-surface`

#### Cards & Interactive Elements
- [ ] Cards have `card-hover-gradient` where appropriate
- [ ] Buttons have proper hover states
- [ ] Interactive elements have consistent transitions

#### CTA Section
- [ ] Has `gradient-mesh-subtle` or `gradient-mesh-primary`
- [ ] Typography matches standards
- [ ] Buttons use standard variants

---

## Phase 4: Implementation Workflow

### Step 1: Create Tracking Plan

Before any code changes:

1. Copy the inventory lists above
2. Check off items as you audit them
3. Note which items need updates
4. Estimate total edits needed

### Step 2: Batch by Category

Group changes for efficiency:

**Batch A: CSS Utilities (if adding new ones)**
- Add to `globals.css`
- Test in isolation first

**Batch B: Landing Page Sections**
- Work through each section component
- Verify after each file

**Batch C: Product Pages**
- SovraGov, SovraID, SovraWallet, SovraChain
- Similar structure, batch similar changes

**Batch D: Content Pages**
- About, Case Studies, Manifesto, Knowledge
- Partners, Partners Portal

**Batch E: Supporting Pages**
- Terms, Privacy, Demo

**Batch F: Layout & UI Components**
- Header, Footer
- Button, Accordion, etc.

### Step 3: Verify After Each Batch

```bash
npm run build
```

Fix any TypeScript errors before proceeding.

### Step 4: Visual Verification

After all changes:
- [ ] Check dark theme on all pages
- [ ] Check light theme on all pages
- [ ] Check mobile responsive on all pages
- [ ] Verify EN, ES, PT-BR locales render correctly

---

## Phase 5: Post-Audit Documentation

After completing an audit, update:

1. **This file** - Add any new patterns discovered
2. **STYLING.md** - Add new utility classes
3. **COMPONENTS.md** - Update component patterns if changed
4. **CLAUDE_CONTEXT.md** - Note major changes for future sessions

---

## Quick Reference: CSS Utilities

### Current Design Utilities (globals.css)

```css
/* Backgrounds */
.noise-overlay              /* Noise texture overlay */
.gradient-mesh-primary      /* Primary colorful gradient */
.gradient-mesh-subtle       /* Subtle muted gradient */
.grid-pattern               /* Geometric grid background */

/* Section Transitions */
.section-fade-top           /* Top fade gradient */
.section-fade-bottom        /* Bottom fade gradient */

/* Interactive */
.card-hover-gradient        /* Card hover with gradient + lift */
.btn-glow-pulse             /* Button glow animation */

/* Text Effects */
.text-gradient-animated     /* Animated gradient text */

/* Surface Depth */
.surface-depth-1            /* Subtle surface */
.surface-depth-2            /* Medium surface */
.surface-depth-3            /* Elevated surface */
```

### Opacity Conventions

```
opacity-15  /* Very subtle grid patterns */
opacity-20  /* Standard grid patterns */
opacity-30  /* More visible patterns */
opacity-50  /* Semi-visible overlays */
```

---

## Lessons Learned

### From January 2025 Audit

1. **Plan comprehensively first** - We updated landing sections, then product pages, then discovered content pages weren't updated. Had to go back and fix.

2. **Use grep to verify** - Before declaring complete, grep for the utility classes to see actual usage count across all files.

3. **Track with todos** - Use the TodoWrite tool to track progress through each page/section.

4. **Batch similar changes** - All product pages have similar structure, edit them together.

5. **Build after each batch** - Catch TypeScript errors early, not at the end.

6. **Document new patterns** - When adding new utilities, immediately document in STYLING.md.

---

*Last updated: January 2025*
