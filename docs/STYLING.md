# Styling Conventions

## Tailwind CSS v4

This project uses Tailwind CSS v4 with CSS-based configuration via `@theme inline` in `globals.css`.

## Color Palette

### Brand Colors (CSS Variables)
```css
--color-dark-bg: #0a0915;      /* Main background */
--color-dark-surface: #0f0d1a; /* Card/surface background */
--color-primary: #0099ff;       /* Primary blue (dark) / #0077cc (light) */
--color-primary-dark: #2060df;  /* Primary hover */
--color-neutral: #888888;       /* Secondary text */
```

### Product Colors
- **SovraGov**: Blue (`from-blue-500 to-blue-600`)
- **SovraWallet**: Purple (`from-purple-500 to-purple-600`)
- **SovraID**: Green (`from-green-500 to-green-600`)
- **SovraChain**: Orange (`from-orange-500 to-orange-600`)

## Common Patterns

### Section Layout
```tsx
<section className="py-24 bg-dark-bg">
  {/* or bg-dark-surface for alternating sections */}
</section>
```

### Cards

**Standard Card:**
```tsx
<div className="bg-dark-surface border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
```

**Product Card (darker with gradient):**
```tsx
<div className="group relative bg-black border border-transparent rounded-2xl p-8
                hover:border-white/20 hover:shadow-glow-primary transition-all
                duration-300 card-hover-gradient">
  {/* Uses card-hover-gradient for dark overlay effect */}
</div>
```

### Badges/Pills
```tsx
<span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
  Badge Text
</span>
```

### Buttons

**Standard Buttons (theme-aware):**
```tsx
// Primary - adapts to theme automatically
<button className="px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors">

// Secondary
<button className="px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">

// Outline
<button className="px-6 py-3 border border-white/20 text-white rounded-full hover:border-white/40 transition-colors">
```

**Buttons with Solid Colors (theme-independent):**

When using ANY solid colored background (brand colors, character colors, Tailwind colors like `bg-purple-500`), you MUST force white text/icons to ensure visibility in both themes:

```tsx
// ❌ WRONG - text may turn dark in light theme
<button className="bg-[#FF6719] text-white">Subscribe</button>
<button className="bg-purple-500 text-white">Start</button>
<button className={`${colors.solid} text-white`}>Continue</button>

// ✅ CORRECT - use !important to force white
<button className="bg-[#FF6719] hover:bg-[#FF6719]/90 !text-white [&_svg]:!fill-white">
  <SubstackIcon className="w-5 h-5" />
  <span>Subscribe</span>
</button>

// ✅ CORRECT - dynamic character/product colors
<button className={`${colors.solid} !text-white`}>
  Start <span>→</span>
</button>

// ✅ CORRECT - with SVG icons using stroke
<Link className={`${colors.solid} !text-white`}>
  Explore benefits
  <svg stroke="currentColor" strokeWidth={2}>...</svg>
</Link>
```

**Brand Button Examples:**
```tsx
// X/Twitter - dark gray background, white text
className="bg-neutral-800 hover:bg-neutral-700 text-white"

// Substack - orange background, forced white
className="bg-[#FF6719] hover:bg-[#FF6719]/90 !text-white [&_svg]:!fill-white"

// YouTube - red background, forced white
className="bg-[#FF0000] hover:bg-[#FF0000]/90 !text-white [&_svg]:!fill-white"

// LinkedIn - blue background, forced white
className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 !text-white [&_svg]:!fill-white"
```

**Character/Product Color Buttons (Demo Flow):**
```tsx
// Character colors use dynamic classes like bg-purple-500, bg-green-500, bg-blue-500
const colors = getCharacterColors(character.color);

// Always use !text-white for solid backgrounds
<button className={`${colors.solid} !text-white font-medium rounded-full`}>
  {t("dashboard.start")}
</button>

<Link className={`${colors.solid} !text-white font-semibold rounded-full`}>
  {t("dashboard.completion.exploreBenefits")}
  <svg stroke="currentColor">→</svg>
</Link>
```

**Why `!important`?** The light theme has CSS overrides that change `text-white` to dark text for readability. Using `!text-white` (Tailwind's `!important` modifier) ensures the text stays white on colored backgrounds regardless of theme. SVG icons using `stroke="currentColor"` or `fill="currentColor"` will inherit the forced white color.

**Quick Reference - When to use `!text-white`:**

| Background Type | Example | Needs `!text-white`? |
|-----------------|---------|---------------------|
| `bg-primary` | Primary buttons | ❌ No - has CSS override |
| `bg-neutral-800` | X/Twitter buttons | ❌ No - has CSS override |
| `bg-[#FF6719]` | Substack orange | ✅ Yes - custom hex |
| `bg-purple-500` | Product colors | ✅ Yes - no CSS override |
| `bg-orange-500` | SovraChain buttons | ✅ Yes - no CSS override |
| `bg-linear-to-*` | Gradient backgrounds | ✅ Yes - gradients |
| `${colors.solid}` | Dynamic colors | ✅ Yes - template literals |
| Admin pages | Any button | ❌ No - isolated via `data-admin-panel` |

**Elements requiring `!text-white` across the codebase:**
- Demo flow: Start, Continue, Explore benefits buttons
- Use-cases pages: Number badges, contextual CTAs
- Product pages: Colored CTA buttons (purple, orange)
- Manifesto: Number badges, Join Mission button
- Partners portal: Purple action buttons
- Newsroom: Source-colored subscribe buttons

**CSS Triangle Play Icons on Colored Backgrounds:**

When creating play button icons using CSS borders (triangles), the border colors also need `!important`:

```tsx
// ❌ WRONG - borders may change in light theme
<span className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[7px] border-l-white border-b-[5px] border-b-transparent" />

// ✅ CORRECT - force white borders with !important
<span className="w-0 h-0 !border-t-[5px] !border-t-transparent !border-l-[7px] !border-l-white !border-b-[5px] !border-b-transparent" />
```

**Full animated play button pattern:**
```tsx
<Link href="/demo" className="bg-blue-500 hover:bg-blue-600 !text-white px-6 py-3 rounded-xl">
  <span className="relative flex items-center justify-center w-5 h-5">
    {/* Pulsing ring */}
    <span className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75" />
    {/* Inner circle */}
    <span className="relative flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
      {/* Play triangle - ALL borders need !important */}
      <span className="w-0 h-0 !border-t-[5px] !border-t-transparent !border-l-[7px] !border-l-white !border-b-[5px] !border-b-transparent ml-0.5" />
    </span>
  </span>
  Try Demo
</Link>
```

### Text Hierarchy
```tsx
<h1 className="text-4xl md:text-5xl font-bold">        {/* Hero title */}
<h2 className="text-3xl md:text-4xl font-bold">        {/* Section title */}
<h3 className="text-xl font-bold text-white">          {/* Card title */}
<p className="text-neutral">                            {/* Body text */}
<span className="text-sm text-neutral">                {/* Small/meta text */}
```

### Opacity Conventions
- `/5` - Very subtle (borders, hover states)
- `/10` - Light backgrounds, badges
- `/20` - Stronger backgrounds, hover borders
- `/30` - Visible borders
- `/50` - Semi-transparent overlays
- `/80` - Backdrop blur backgrounds

## Responsive Breakpoints

```tsx
// Mobile first approach
className="text-base md:text-lg lg:text-xl"

// Hide/show
className="hidden lg:block"  // Desktop only
className="lg:hidden"         // Mobile only

// Grid adjustments
className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
```

## Animation Classes

Using Framer Motion, but also utility transitions:
```tsx
className="transition-colors"      // Color transitions
className="transition-all"         // All properties
className="transition-transform"   // Transform only
```

## Z-Index Scale

- `z-30` - Step indicators
- `z-40` - Navigation elements
- `z-50` - Header, modals

## Theme System

See `docs/THEMING.md` for full documentation on:
- Dark/light theme architecture
- Admin panel theme isolation
- Anti-flash script
- CSS override patterns

### Key Principle: No `dark:` Variants

This project does **NOT** use Tailwind's `dark:` variants. Instead:
- Dark theme is default (via `:root, .dark` CSS)
- Light theme uses `.light` class on `<html>` element
- Overrides are done in `globals.css` with `.light .class-name` pattern

```css
/* WRONG - Don't use dark: variants */
<div className="bg-white dark:bg-gray-900">

/* RIGHT - Use theme-aware utilities */
<div className="bg-dark-surface">  /* CSS variable handles both themes */

/* RIGHT - Add light override in globals.css if needed */
.light .bg-neutral-800 {
  background-color: rgba(0, 0, 0, 0.08);
}
```

### Light Mode Overrides with `@layer utilities`

**Important:** When overriding Tailwind utility classes (like `text-amber-200`, `bg-amber-500/10`, etc.) in light mode, you **must** place your CSS inside `@layer utilities` in `globals.css`. Otherwise, Tailwind's utilities will have higher specificity and your overrides won't work.

```css
/* WRONG - Outside @layer, won't override Tailwind classes */
.light .my-warning {
  background-color: rgba(245, 158, 11, 0.15) !important;
}

.light .my-warning p {
  color: #92400e !important;  /* Won't work! */
}

/* RIGHT - Inside @layer utilities, properly overrides Tailwind */
@layer utilities {
  .light .my-warning {
    background-color: rgba(245, 158, 11, 0.15) !important;
  }

  .light .my-warning p {
    color: #92400e !important;  /* Works! */
  }
}
```

**Steps to add a light mode override:**

1. Add a custom class to your component (e.g., `deep-link-warning`)
2. Find the `@layer utilities` block in `globals.css` (around line 549)
3. Add your `.light .your-class` rules inside that block
4. Use `!important` to ensure override of Tailwind utilities

**Example from the demo page:**
```tsx
// Component with custom class for light mode targeting
<div className="bg-amber-500/10 border border-amber-500/30 rounded-xl deep-link-warning">
  <p className="text-amber-200">Warning message</p>
</div>
```

```css
/* In globals.css, inside @layer utilities */
@layer utilities {
  .light .deep-link-warning {
    background-color: rgba(245, 158, 11, 0.15) !important;
    border-color: rgba(217, 119, 6, 0.4) !important;
  }

  .light .deep-link-warning p {
    color: #92400e !important;
  }
}
```

### Theme-Independent Colors (Inline Styles)

When colors should **never** change with theme (brand colors, platform colors), use hex values in inline styles:

```tsx
// In config file
export const SOURCE_CONFIG = {
  twitter: {
    color: "#0ea5e9",  // Hex for inline styles
    bgClass: "bg-sky-500",  // Tailwind class when needed
  },
};

// In component - inline style ignores all theme CSS
<span style={{ color: config.color }}>{count}</span>
<Icon style={{ color: config.color }} />
```

**Why:** Inline styles have highest CSS specificity, unaffected by `.light` overrides.

### Admin Panel Isolation

Admin pages use `data-admin-panel` attribute to prevent public theme changes from affecting admin UI:

```css
/* Public site override */
.light .bg-neutral-800 {
  background-color: rgba(0, 0, 0, 0.08);
}

/* Admin isolation - keeps dark value */
.light [data-admin-panel] .bg-neutral-800 {
  background-color: #262626 !important;
}
```

## Design Utilities (globals.css)

Custom CSS utilities for consistent visual effects across the site.

### Background Effects

```css
.noise-overlay              /* Subtle noise texture overlay */
.gradient-mesh-primary      /* Colorful multi-stop gradient mesh */
.gradient-mesh-subtle       /* Muted gradient mesh for sections */
.grid-pattern               /* Geometric grid background pattern */
```

**Usage:**
```tsx
{/* Hero sections */}
<section className="relative overflow-hidden noise-overlay">
  <div className="absolute inset-0 gradient-mesh-primary" />
</section>

{/* Feature sections */}
<section className="relative overflow-hidden">
  <div className="absolute inset-0 grid-pattern opacity-20" />
</section>
```

### Section Transitions

```css
.section-fade-top           /* Gradient fade from top edge */
.section-fade-bottom        /* Gradient fade from bottom edge */
```

**Usage:**
```tsx
<section className="py-24 bg-dark-surface section-fade-top">
```

### Interactive Effects

```css
.card-hover-gradient        /* Card with dark overlay + gradient reveal on hover */
.btn-glow-pulse             /* Button with pulsing glow on hover */
.text-gradient-animated     /* Text with animated color gradient */
```

**Card Hover Gradient Details:**
- Dark theme: `linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)`
- Light theme: `linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.05) 100%)`
- On hover: reveals a colorful gradient overlay (primary → purple → orange)

**Usage:**
```tsx
{/* Cards */}
<div className="bg-black rounded-2xl p-6 border border-transparent card-hover-gradient">

{/* Primary buttons - already applied via Button component */}
<Button variant="primary">Click me</Button>

{/* Animated text */}
<h2 className="text-4xl font-bold text-gradient-animated">
```

### Surface Depth

```css
.surface-depth-1            /* Subtle elevation */
.surface-depth-2            /* Medium elevation */
.surface-depth-3            /* High elevation */
```

### Typography Standards

```tsx
{/* Hero titles */}
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-[0.95]">

{/* Section titles */}
<h2 className="text-4xl md:text-5xl font-bold font-display">

{/* Card titles */}
<h3 className="text-xl md:text-2xl font-bold font-display">

{/* Badges - ALWAYS use this pattern */}
<span className="text-xs font-semibold uppercase tracking-wider">
```

---

## Hero Section Pattern

When creating new public pages, follow this hero section structure:

```tsx
<section className="py-24 relative overflow-hidden">
  {/* Background - use HeroBackground component */}
  <HeroBackground colorScheme="default" /> {/* or "newsroom", "products", etc. */}

  <Container className="relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto text-center"
    >
      {/* Badge */}
      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider rounded-full mb-6">
        {t("badge")}
      </span>

      {/* Title with gradient highlight */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6">
        {t("title")}
        <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-400">
          {t("titleHighlight")}
        </span>
      </h1>

      {/* Description */}
      <p className="text-xl text-neutral max-w-2xl mx-auto mb-8">
        {t("description")}
      </p>

      {/* CTA buttons or content */}
    </motion.div>
  </Container>
</section>
```

---

## CTA Section Pattern

Subscribe/action CTA sections at the bottom of pages:

```tsx
<section className="py-24 bg-dark-bg relative overflow-hidden">
  {/* Subtle background effects */}
  <div className="absolute inset-0 gradient-mesh-subtle" />
  <DotPattern id="page-cta" className="opacity-50" />

  <Container>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-primary/10 via-dark-surface to-purple-500/5 rounded-3xl p-12 overflow-hidden border border-primary/10 text-center"
    >
      {/* Background decoration blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Animated gradient title */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display mb-4 leading-tight text-gradient-animated-cta">
          {t("cta.title")}
        </h2>

        <p className="text-neutral text-lg mb-8 max-w-xl mx-auto">
          {t("cta.description")}
        </p>

        {/* Action buttons - use brand colors with forced white */}
        <div className="flex flex-wrap justify-center gap-3">
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 !text-white font-semibold rounded-xl">
            Primary Action
          </button>
        </div>
      </div>
    </motion.div>
  </Container>
</section>
```

**Key CTA elements:**
- `text-gradient-animated-cta` - Animated gradient text for the title
- Background blobs with `blur-3xl` for depth
- `from-primary/10 via-dark-surface to-purple-500/5` gradient card background
- `border-primary/10` subtle border
