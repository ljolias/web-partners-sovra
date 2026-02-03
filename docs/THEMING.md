# Theming System

## Overview

The website supports **dark** (default) and **light** themes with smooth transitions. The public site and admin panel have **independent** theme systems:

| Area | localStorage Key | Default | System Preference |
|------|------------------|---------|-------------------|
| Public site | `sovra-theme` | dark | Respects if no saved preference |
| Admin panel | `admin-theme` | dark | Never (always defaults to dark) |

## Architecture

### 1. Theme Context (`src/context/ThemeContext.tsx`)

For public pages only:
```tsx
// Provides: theme, toggleTheme, setTheme
const { theme, toggleTheme } = useTheme();
```

### 2. Anti-Flash Script (`src/app/layout.tsx`)

Inline script in `<head>` prevents flash of wrong theme on load. **Detects admin pages and uses separate theme key:**

```js
(function() {
  try {
    var isAdmin = window.location.pathname.startsWith('/admin');
    var themeKey = isAdmin ? 'admin-theme' : 'sovra-theme';
    var theme = localStorage.getItem(themeKey);
    if (isAdmin) {
      // Admin defaults to dark, only go light if explicitly set
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } else {
      // Public site: check theme or system preference
      if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  } catch (e) {}
})();
```

### 3. CSS Variables (`src/app/globals.css`)

```css
/* Dark theme (default) */
:root, .dark {
  --background: #0a0915;
  --foreground: #ededed;
  --color-primary: #0099ff;
  /* ... */
}

/* Light theme */
.light {
  --background: #f8f9fa;
  --foreground: #1a1a2e;
  --color-primary: #0077cc;
  /* ... */
}
```

## Admin Panel Isolation

The admin panel uses a CSS isolation system to prevent public site theme changes from affecting admin UI.

### How It Works

1. **AdminShell wrapper** adds `data-admin-panel` attribute to its root div
2. **CSS isolation rules** use higher specificity: `.light [data-admin-panel] .class-name`
3. **`!important`** ensures admin styles override any cascade

### AdminShell (`src/components/admin/AdminShell.tsx`)

```tsx
<div data-admin-panel className={`min-h-screen ${themeClasses.bg}`}>
  {children}
</div>
```

### CSS Isolation Pattern (`src/app/globals.css`)

```css
/* =====================================================
   ADMIN PANEL ISOLATION
   Prevents marketing site's .light theme from affecting admin
   ===================================================== */

/* Core isolation - higher specificity than .light .class-name */
.light [data-admin-panel] .text-white {
  color: white !important;
}

.light [data-admin-panel] .text-neutral {
  color: #888888 !important;
}

.light [data-admin-panel] .bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.light [data-admin-panel] .border-white\/10 {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* ... many more isolation rules for all utility classes */
```

### When to Add Admin Isolation Rules

When adding new public site light theme overrides (`.light .class-name`), also add the corresponding admin isolation rule if that class is used in admin:

```css
/* Public site override */
.light .bg-neutral-800 {
  background-color: rgba(0, 0, 0, 0.08);
}

/* Admin isolation (keeps original dark value) */
.light [data-admin-panel] .bg-neutral-800 {
  background-color: #262626 !important;
}
```

## Light Theme Overrides

The light theme requires extensive CSS overrides because Tailwind classes like `text-white`, `bg-dark-bg`, etc. need to adapt. Key patterns:

### Text Colors
```css
.light .text-white { color: var(--color-text-primary); }  /* Dark text */
.light .text-white\/70 { color: rgba(26, 26, 46, 0.7); }
.light .text-neutral { color: var(--color-text-secondary); }
```

### Backgrounds
```css
.light .bg-dark-bg { background-color: var(--color-bg); }
.light .bg-dark-surface { background-color: var(--color-surface); }
.light .bg-white\/5 { background-color: rgba(0, 0, 0, 0.03); }
```

### Colored Elements (Purple, Green, Blue, Orange, Red, Yellow)

Each color family has overrides for better contrast:
```css
.light .text-purple-400 { color: #7c3aed; }
.light .bg-purple-500\/10 { background-color: rgba(124, 58, 237, 0.12); }
.light .border-purple-500\/30 { border-color: rgba(124, 58, 237, 0.4); }
```

### Buttons with Solid Backgrounds

Standard Tailwind buttons get CSS overrides:
```css
.light .bg-primary.text-white,
.light .bg-purple-500.text-white,
.light a.bg-primary { color: #ffffff !important; }
```

### Buttons with Solid Colors (Critical!)

When using ANY solid colored background (brand hex colors, Tailwind color classes like `bg-purple-500`, or dynamic character colors), you MUST use `!important` modifiers in Tailwind:

```tsx
// ❌ WRONG - text turns dark in light theme
<button className="bg-[#FF6719] text-white">Subscribe</button>
<button className="bg-purple-500 text-white">Start</button>
<button className={`${colors.solid} text-white`}>Continue</button>

// ✅ CORRECT - !text-white forces white text in all themes
<button className="bg-[#FF6719] hover:bg-[#FF6719]/90 !text-white [&_svg]:!fill-white">
  <SubstackIcon className="w-5 h-5" />
  <span>Subscribe</span>
</button>

// ✅ CORRECT - dynamic character/product colors (demo flow)
<button className={`${colors.solid} !text-white font-medium rounded-full`}>
  {t("dashboard.start")}
</button>
```

**Color reference:**
| Type | Background | Text/Icon Classes |
|------|------------|-------------------|
| X/Twitter | `bg-neutral-800` | `text-white` (has CSS override) |
| Substack | `bg-[#FF6719]` | `!text-white [&_svg]:!fill-white` |
| YouTube | `bg-[#FF0000]` | `!text-white [&_svg]:!fill-white` |
| LinkedIn | `bg-[#0A66C2]` | `!text-white [&_svg]:!fill-white` |
| Character colors | `bg-purple-500`, `bg-green-500`, etc. | `!text-white` |
| Primary buttons | `bg-primary` | `!text-white` (when in colored context) |

**Why X/Twitter doesn't need `!important`:** The `bg-neutral-800` class has a corresponding `.light` override in CSS, so `text-white` works normally. Custom hex colors like `bg-[#FF6719]` and Tailwind color classes like `bg-purple-500` have no specific CSS overrides, so the generic `.light .text-white` rule changes it to dark text.

**SVG icons:** Icons using `stroke="currentColor"` or `fill="currentColor"` will inherit the forced white color from `!text-white`.

**Complete reference - When `!text-white` is needed:**

| Background Type | Example | Needs `!text-white`? | Reason |
|-----------------|---------|---------------------|--------|
| `bg-primary` | Primary CTA buttons | ❌ No | Has `.light .bg-primary.text-white` CSS override |
| `bg-neutral-800` | X/Twitter buttons | ❌ No | Has `.light .bg-neutral-800` CSS override |
| `bg-[#hex]` | `bg-[#FF6719]` Substack | ✅ Yes | No CSS override for arbitrary hex values |
| `bg-{color}-500` | `bg-purple-500`, `bg-orange-500` | ✅ Yes | No comprehensive CSS overrides for all colors |
| `bg-linear-to-*` | Gradient backgrounds | ✅ Yes | Gradients have no CSS overrides |
| `${variable}` | `${colors.solid}` | ✅ Yes | Dynamic values can't have static CSS overrides |
| Admin pages | Any background | ❌ No | Isolated via `data-admin-panel` attribute |

**Pages with `!text-white` applied:**
- `/demo` - Start, Continue, Explore benefits, character-colored buttons
- `/use-cases/*` - Number badges, contextual industry CTAs
- `/sovrachain` - Orange "Mainnet Explorer" button
- `/sovrawallet` - Purple gradient icons, download buttons
- `/manifesto` - Number badges, purple "Join Mission" button
- `/partners/portal` - Purple action buttons
- `/newsroom` - Source-colored subscribe buttons (Substack, YouTube, LinkedIn)

### SVGs

SVGs inside colored backgrounds must preserve white:
```css
.light .bg-primary svg.text-white { color: #ffffff !important; }
.light svg [fill="white"] { fill: white !important; }
```

## Adding New Colors

When adding new Tailwind color classes, add corresponding light theme overrides:

1. **Text**: `.light .text-{color}-400 { color: #darker-shade; }`
2. **Background**: `.light .bg-{color}-500\/10 { background-color: rgba(r,g,b, 0.12); }`
3. **Border**: `.light .border-{color}-500\/30 { border-color: rgba(r,g,b, 0.4); }`
4. **Hover**: `.light .hover\:bg-{color}:hover { ... }`
5. **Admin isolation** (if used in admin): `.light [data-admin-panel] .class-name { ... !important; }`

## Theme Toggle Component

Located in `Header.tsx`:
```tsx
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  // Animated sun/moon icons with Framer Motion
}
```

## Inline Styles for Theme-Independent Colors

When you need colors that should **never** be affected by theme changes (like brand colors in admin cards), use **hex colors in inline styles**:

```tsx
// In config file (e.g., src/config/newsroom.ts)
export const SOURCE_CONFIG = {
  twitter: {
    label: "X / Twitter",
    color: "#0ea5e9",  // Hex for inline styles
    bgClass: "bg-sky-500",  // Tailwind class when needed
  },
  // ...
};

// In component
<span style={{ color: config.color }}>{count}</span>
<SourceIcon style={{ color: config.color }} />
```

**Why:** Inline styles have the highest CSS specificity and aren't affected by any `.light` or theme overrides.

## Animations & Dark-Context Components

When creating animated components or UI elements that need to work properly in **both themes**, follow these patterns learned from the SovraWallet agentic demo.

### Pattern 1: Theme-Adaptive Elements (Outside a Dark Context)

For elements that should change color based on site theme, use the `useTheme()` hook:

```tsx
import { useTheme } from "@/context/ThemeContext";

function MyComponent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Define colors for both themes
  const colors = {
    stroke: isDark ? '#93c5fd' : '#1e3a8a',  // blue-300 : blue-900
    background: isDark
      ? 'rgba(59,130,246,0.4)'
      : 'rgba(59,130,246,0.5)',
  };

  return (
    <div style={{
      background: colors.background,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
    }}>
      <svg style={{ color: colors.stroke }}>...</svg>
    </div>
  );
}
```

**Important:** Tailwind's `dark:` variants may not work reliably in all contexts. The `useTheme()` hook with inline styles is the most reliable approach.

### Pattern 2: Dark-Context Elements (Always Dark Background)

For components that should **always appear dark** regardless of site theme (like phone mockups, device frames, terminal UIs):

```tsx
// ✅ CORRECT - Hardcoded dark colors via inline styles
<div
  className="rounded-2xl overflow-hidden"
  style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
>
  <p style={{ color: '#ffffff' }}>Always white text</p>
  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Muted text</span>
  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>Subtle bg</div>
</div>

// ❌ WRONG - Tailwind classes get overridden by .light theme
<div className="bg-slate-900 text-white">
  <p className="text-white">This turns dark in light mode!</p>
</div>
```

### Color Reference for Dark Contexts

Use these hardcoded values for elements inside dark-context containers:

| Purpose | Inline Style Value | Notes |
|---------|-------------------|-------|
| **Backgrounds** | | |
| Deep dark | `#0f172a` | slate-950 |
| Dark surface | `#1e293b` | slate-800 |
| Subtle overlay | `rgba(255,255,255,0.05)` | white/5 equivalent |
| Card hover | `rgba(255,255,255,0.1)` | white/10 equivalent |
| **Text** | | |
| Primary white | `#ffffff` | Pure white |
| Secondary | `rgba(255,255,255,0.6)` | 60% white |
| Muted | `rgba(255,255,255,0.4)` | 40% white |
| Hint | `rgba(255,255,255,0.3)` | 30% white |
| **Borders** | | |
| Subtle | `rgba(255,255,255,0.1)` | Barely visible |
| Visible | `rgba(255,255,255,0.2)` | Clearly visible |
| **Accent Colors** | | |
| Purple | `#c084fc` (light) / `#a855f7` (medium) | purple-400/500 |
| Blue | `#60a5fa` (light) / `#3b82f6` (medium) | blue-400/500 |
| Green | `#34d399` (light) / `#10b981` (medium) | emerald-400/500 |
| Orange | `#fb923c` (light) / `#f97316` (medium) | orange-400/500 |
| Emerald success | `#6ee7b7` | emerald-300 |

### Pattern 3: Gradients

Always use inline styles for gradients:

```tsx
// ✅ CORRECT
<div style={{
  background: 'linear-gradient(to bottom, #581c87, #020617)' // purple-900 to slate-950
}}>

// For credentials/cards
<div style={{
  background: 'linear-gradient(to right, #2563eb, #1e40af)' // blue-600 to blue-800
}}>

// ❌ WRONG - Tailwind gradients affected by theme
<div className="bg-gradient-to-b from-purple-900 to-slate-950">
```

### Pattern 4: SVG Icons in Dark Contexts

For SVGs that use `currentColor`, set the color via inline style on parent or directly:

```tsx
// Option 1: Parent span with color
<span style={{ color: '#ffffff' }}>
  <WalletIcon className="w-6 h-6" /> {/* Uses currentColor */}
</span>

// Option 2: Direct stroke/fill on SVG
<svg
  style={{ color: '#60a5fa' }}
  stroke="currentColor"
  fill="currentColor"
>
  ...
</svg>

// Option 3: Explicit stroke/fill colors
<svg viewBox="0 0 24 24" fill="none">
  <path stroke="#ffffff" strokeWidth="1.5" d="..." />
  <circle fill="#60a5fa" cx="12" cy="12" r="4" />
</svg>
```

### Pattern 5: Animated Elements (Framer Motion)

For Framer Motion animations, use inline styles for colors:

```tsx
<motion.div
  style={{
    background: 'linear-gradient(to right, #14b8a6, #0f766e)',
    border: '2px solid rgba(255,255,255,0.4)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  <span style={{ color: '#ffffff' }}>Flying Card</span>
</motion.div>
```

### Pattern 6: Mixed Context (Some Theme-Adaptive, Some Always-Dark)

When you have both theme-adaptive AND always-dark elements in the same component:

```tsx
function DemoComponent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex gap-8">
      {/* Theme-adaptive container (outside the phone) */}
      <div style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(100,116,139,0.15)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(100,116,139,0.3)'}`,
      }}>
        <p style={{ color: isDark ? '#ffffff' : '#111827' }}>Adapts to theme</p>
      </div>

      {/* Always-dark phone mockup */}
      <div style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}>
        <p style={{ color: '#ffffff' }}>Always white</p>
      </div>
    </div>
  );
}
```

### Common Mistakes to Avoid

1. **Using Tailwind's `dark:` variants inside dark contexts**
   ```tsx
   // ❌ Won't work - dark: only applies when site is in dark mode
   <div className="text-blue-300 dark:text-blue-400">

   // ✅ Use hardcoded color for always-dark contexts
   <span style={{ color: '#93c5fd' }}>
   ```

2. **Forgetting `text-white` gets overridden in light mode**
   ```tsx
   // ❌ This text turns dark in light mode
   <p className="text-white">Hello</p>

   // ✅ Inline style persists
   <p style={{ color: '#ffffff' }}>Hello</p>
   ```

3. **Using CSS variables that change with theme**
   ```tsx
   // ❌ These variables change in .light theme
   <div className="bg-dark-bg text-foreground">

   // ✅ Hardcode for dark contexts
   <div style={{ background: '#0a0915', color: '#ededed' }}>
   ```

4. **Mixing Tailwind bg classes with theme-aware colors**
   ```tsx
   // ❌ bg-white/10 behaves differently in light mode
   <div className="bg-white/10 rounded-lg">

   // ✅ Explicit rgba value
   <div style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} className="rounded-lg">
   ```

### Quick Reference: When to Use What

| Scenario | Approach |
|----------|----------|
| Element adapts to site theme | `useTheme()` + inline styles |
| Element always dark (phone, terminal) | Hardcoded inline styles |
| Gradient backgrounds | Always inline style |
| Text on dark background (in dark context) | `style={{ color: '#ffffff' }}` |
| Accent colors in dark context | Hardcoded hex: `#c084fc`, `#60a5fa`, etc. |
| Borders in dark context | `rgba(255,255,255,0.1)` or similar |
| Theme-adaptive borders | `isDark ? 'rgba(...)' : 'rgba(...)'` |
| SVG colors | `style={{ color: '#hex' }}` or explicit fill/stroke |

### Pattern 7: Card Components with Tailwind Class Switching

For card components that use Tailwind classes extensively (like Products.tsx), use the `useTheme()` hook with conditional Tailwind classes instead of inline styles:

```tsx
import { useTheme } from "@/context/ThemeContext";

function ProductCard({ product }: { product: Product }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Define theme-adaptive Tailwind classes
  const cardBackground = isDark ? "bg-black" : "bg-white";
  const cardBorder = isDark ? "border-white/5" : "border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-neutral" : "text-gray-600";
  const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-gray-50";

  return (
    <div className={`${cardBackground} ${cardBorder} ${hoverBg} border rounded-2xl p-6`}>
      <h3 className={textPrimary}>{product.title}</h3>
      <p className={textSecondary}>{product.description}</p>
    </div>
  );
}
```

**When to use this pattern:**
- Components with many theme-dependent Tailwind classes
- Cards with hover states, borders, and text that need to adapt
- When inline styles would be too verbose

**Note:** This pattern is useful when CSS `.light` overrides don't exist for the specific Tailwind classes you need, or when you want explicit control over the theme behavior in the component itself.
