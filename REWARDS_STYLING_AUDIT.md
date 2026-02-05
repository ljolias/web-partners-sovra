# Rewards Section - Styling & Theming Audit Report

**Date:** February 5, 2026
**Audited By:** Claude Code
**Status:** ⚠️ NEEDS CORRECTIONS

---

## Executive Summary

The newly implemented Rewards/Achievement system has significant styling inconsistencies compared to project design standards. The components use **light theme colors** (indigo, blue, gray) that don't align with the dark-first design system. Components need updates to:

1. Use project color variables instead of hardcoded colors
2. Follow dark/light theming patterns from `THEMING.md`
3. Adopt design utilities and card patterns from `STYLING.md`
4. Implement proper theme context awareness

---

## Critical Issues Found

### 🔴 Issue 1: Light Theme Colors Hardcoded

**Files affected:**
- `TierHeader.tsx` (lines 34, 37-38, 42-43, 52)
- `AchievementCard.tsx` (lines 26-27, 33)
- `TierRoadmap.tsx` (lines 23-47, 79-82, 96, 102, 130, 142)

**Problem:**
```tsx
// ❌ WRONG - Hardcoded light colors
<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 p-6">
<div className="rounded-lg bg-indigo-100 p-3">
```

**Impact:**
- These cards only look good in **light mode**
- In dark mode, they appear washed out and low contrast
- Breaks the dark-first design philosophy

**Standards violated:**
- STYLING.md: "Use `bg-dark-surface` for cards, not hardcoded colors"
- THEMING.md: "Light theme colors work only when proper overrides exist"

---

### 🔴 Issue 2: Missing Theme Context Usage

**Files affected:**
- All achievement components
- `AchievementsSummaryCard.tsx`

**Problem:**
Components don't use `useTheme()` hook despite having theme-adaptive needs.

**Standard pattern** (from THEMING.md, Pattern 7):
```tsx
import { useTheme } from "@/context/ThemeContext";

function MyComponent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBackground = isDark ? "bg-dark-surface" : "bg-white";
  const cardBorder = isDark ? "border-white/5" : "border-gray-200";
  // ...
}
```

**Current state:** Components use static Tailwind classes without theme awareness.

---

### 🔴 Issue 3: Non-standard Card Patterns

**Files affected:**
- `TierHeader.tsx`: Uses inline Card with gradient
- `AchievementCard.tsx`: Uses inline Card with opacity
- All component files

**Problem:**
Cards don't follow the standard pattern from STYLING.md:

```tsx
// ✅ STANDARD PATTERN (from STYLING.md)
<div className="bg-dark-surface rounded-2xl p-6 border border-white/5 card-hover-gradient">
  {/* Content */}
</div>

// ❌ CURRENT PATTERN
<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 p-6">
```

---

### 🔴 Issue 4: Missing Design Utilities

**Files affected:** All achievement components

**Missing utilities that should be used:**
- `card-hover-gradient` - Interactive card effect
- `gradient-mesh-subtle` - Section backgrounds
- `section-fade-top` / `section-fade-bottom` - Section transitions

**Current state:** Components use basic Tailwind without the project's custom effects.

---

### 🟡 Issue 5: Typography Not Following Standards

**Files affected:**
- `TierHeader.tsx` (line 43)
- `TierRoadmap.tsx` (line 60, 90)

**Problem:**
```tsx
// Current
<h2 className="text-3xl font-bold text-gray-900 capitalize">
<h3 className="text-lg font-semibold text-gray-900">

// Should be
<h2 className="text-4xl md:text-5xl font-bold font-display">
<h3 className="text-xl md:text-2xl font-bold font-display">
```

**Standards violated:**
- Not using `font-display` for headings
- Hardcoded `text-gray-900` instead of theme-aware colors
- Missing responsive text sizing (`md:` breakpoints)

---

## Detailed Corrections Needed

### File 1: `TierHeader.tsx`

**Line 34: Card background**
```tsx
// ❌ WRONG
<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 p-6">

// ✅ CORRECT
<Card className="bg-dark-surface border border-white/5 card-hover-gradient p-6">
```

**Line 37-38: Icon container**
```tsx
// ❌ WRONG
<div className="rounded-lg bg-indigo-100 p-3">
  <IconComponent className="h-8 w-8 text-indigo-600" />
</div>

// ✅ CORRECT
<div className="rounded-lg bg-primary/10 p-3">
  <IconComponent className="h-8 w-8 text-primary" />
</div>
```

**Line 42-43: Text colors**
```tsx
// ❌ WRONG
<p className="text-sm text-gray-600">{t('rewards.your_tier')}</p>
<h2 className="text-3xl font-bold text-gray-900 capitalize">

// ✅ CORRECT
<p className="text-sm text-neutral">{t('rewards.your_tier')}</p>
<h2 className="text-4xl md:text-5xl font-bold font-display capitalize">
```

**Line 52-53: Badge**
```tsx
// ❌ WRONG - Badge doesn't adapt to theme
<Badge className="text-lg px-4 py-2 capitalize">

// ✅ CORRECT
<Badge className="text-lg px-4 py-2 capitalize bg-primary text-white">
```

---

### File 2: `AchievementCard.tsx`

**Line 23-28: Card styling**
```tsx
// ❌ WRONG
<Card className={`p-4 transition-all duration-200 ${
  earned
    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200'
    : 'bg-gray-50 border-gray-200 opacity-60'
} hover:shadow-md`}>

// ✅ CORRECT
<Card className={`p-4 transition-all duration-200 card-hover-gradient ${
  earned
    ? 'bg-dark-surface border border-primary/20'
    : 'bg-dark-surface/50 border border-white/5 opacity-60'
}`}>
```

**Line 31-34: Icon container**
```tsx
// ❌ WRONG
<div className={`mt-1 rounded-lg p-2 ${
  earned ? 'bg-indigo-100' : 'bg-gray-200'
}`}>

// ✅ CORRECT
<div className={`mt-1 rounded-lg p-2 ${
  earned ? 'bg-primary/10' : 'bg-white/5'
}`}>
```

**Line 39-44: Icon colors**
```tsx
// ❌ WRONG
className={`h-6 w-6 ${earned ? 'text-indigo-600' : 'text-gray-400'}`}

// ✅ CORRECT
className={`h-6 w-6 ${earned ? 'text-primary' : 'text-neutral'}`}
```

**Line 52-56: Text styling**
```tsx
// ❌ WRONG
<h4 className="font-semibold text-sm text-gray-900">
<p className="text-xs text-gray-600 mt-1">

// ✅ CORRECT
<h4 className="font-semibold text-sm text-white">
<p className="text-xs text-neutral mt-1">
```

---

### File 3: `TierRoadmap.tsx`

**Lines 20-47: Tier config colors**
```tsx
// ❌ WRONG - Light colors that won't work in dark theme
bronze: {
  color: 'from-amber-400 to-amber-600',
  bgColor: 'bg-amber-50 border-amber-300',
},

// ✅ CORRECT - Use dark surfaces with color accents
bronze: {
  color: 'from-amber-400 to-amber-600',
  bgColor: 'bg-dark-surface border-amber-500/30',
},
```

**Line 60: Heading**
```tsx
// ❌ WRONG
<h3 className="text-lg font-semibold text-gray-900">

// ✅ CORRECT
<h3 className="text-xl font-bold font-display text-white">
```

**Line 75-84: Tier card styling**
```tsx
// ❌ WRONG - Complex conditional with light colors
className={`
  relative p-4 rounded-lg border-2 transition-all duration-200
  ${
    isCurrent
      ? `${config.bgColor} ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-105`
      : isCompleted
        ? `${config.bgColor} opacity-100`
        : 'bg-gray-100 border-gray-300 opacity-50'
  }`}

// ✅ CORRECT - Consistent dark surfaces with accent colors
className={`
  relative p-4 rounded-2xl border transition-all duration-200 card-hover-gradient
  ${
    isCurrent
      ? 'bg-dark-surface border-primary ring-2 ring-primary/50 shadow-lg scale-105'
      : isCompleted
        ? 'bg-dark-surface border-white/10 opacity-100'
        : 'bg-dark-surface/50 border-white/5 opacity-50'
  }`}
```

**Line 90: Tier name**
```tsx
// ❌ WRONG
<h4 className="font-bold text-sm text-gray-900 mb-2">

// ✅ CORRECT
<h4 className="font-bold text-sm text-white mb-2">
```

**Line 108-115: Text styling**
```tsx
// ❌ WRONG
<p className="text-xs text-gray-600 mb-2">
<p className="text-sm font-semibold text-gray-900">

// ✅ CORRECT
<p className="text-xs text-neutral mb-2">
<p className="text-sm font-semibold text-white">
```

**Lines 130 & 142: Status messages**
```tsx
// ❌ WRONG - Light gradient backgrounds
<div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded">

// ✅ CORRECT - Dark surfaces with accent borders
<div className="p-4 bg-dark-surface border-l-4 border-primary rounded-lg card-hover-gradient">
```

---

## Files Requiring Updates

| File | Priority | Changes |
|------|----------|---------|
| `TierHeader.tsx` | 🔴 High | 8-10 changes |
| `AchievementCard.tsx` | 🔴 High | 6-8 changes |
| `TierRoadmap.tsx` | 🔴 High | 12-15 changes |
| `NextTierCard.tsx` | 🟡 Medium | ~8 changes |
| `AnnualRenewalCard.tsx` | 🟡 Medium | ~6 changes |
| `BonusAchievements.tsx` | 🟡 Medium | ~5 changes |
| `AchievementProgress.tsx` | 🟡 Medium | ~4 changes |
| `AchievementsSummaryCard.tsx` | 🟡 Medium | ~5 changes |

---

## Implementation Plan

### Phase 1: Update Color System (Priority 1)
Replace all hardcoded light colors with theme variables:
- `from-blue-50 to-indigo-50` → `bg-dark-surface`
- `text-gray-900` → `text-white`
- `text-gray-600` → `text-neutral`
- `bg-indigo-100` → `bg-primary/10`
- `text-indigo-600` → `text-primary`

### Phase 2: Apply Theme Context (Priority 2)
Add `useTheme()` hook to components that need theme-aware styling:
- Implement conditional class logic like Pattern 7 in THEMING.md
- Keep dark theme as default
- Add light theme overrides where needed

### Phase 3: Standardize Card & Heading Styles (Priority 3)
- Use `card-hover-gradient` on all interactive cards
- Update all headings to use `font-display` with responsive sizing
- Replace inline rounded values with `rounded-2xl`

### Phase 4: Add Design Utilities (Priority 4)
- Add `section-fade-top` / `section-fade-bottom` to major sections
- Use `gradient-mesh-subtle` for section backgrounds
- Apply `noise-overlay` to hero-like sections

### Phase 5: Verification (Priority 5)
- Test in dark mode (default)
- Test in light mode
- Test mobile responsiveness
- Verify all 3 locales (EN/ES/PT)

---

## Standards Reference

**Key documents:**
- `docs/STYLING.md` - Card patterns, typography, color usage
- `docs/THEMING.md` - Dark/light theme architecture
- `docs/DESIGN_AUDIT_PROCESS.md` - Consistency standards

**Key patterns to follow:**

### Card Pattern
```tsx
<div className="bg-dark-surface rounded-2xl p-6 border border-white/5 card-hover-gradient">
```

### Heading Pattern
```tsx
<h2 className="text-4xl md:text-5xl font-bold font-display">
```

### Badge Pattern
```tsx
<span className="text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded-full px-4 py-1.5">
```

### Section Pattern
```tsx
<section className="py-24 bg-dark-surface relative overflow-hidden section-fade-top">
  <div className="absolute inset-0 grid-pattern opacity-20" />
  <div className="absolute inset-0 gradient-mesh-subtle" />
  {/* Content */}
</section>
```

---

## Validation Checklist

After implementing all corrections:

- [ ] All hardcoded light colors replaced
- [ ] Theme variables used throughout
- [ ] `useTheme()` hook implemented where needed
- [ ] All headings use `font-display`
- [ ] Cards use `card-hover-gradient`
- [ ] Responsive breakpoints (`md:`, `lg:`) applied
- [ ] Build passes without TypeScript errors
- [ ] Visual verification in dark mode
- [ ] Visual verification in light mode
- [ ] Mobile responsiveness verified
- [ ] All locales tested (EN/ES/PT)

---

## Timeline Estimate

**Total changes:** ~60-80 CSS class updates across 8 files
**Complexity:** Medium (mostly find-and-replace with some logic changes)
**Testing:** 15-20 minutes for full theme/mobile testing

---

**Status:** Ready for implementation
**Owner:** To be assigned
**Blocking:** No - System functions but appearance doesn't match design standards
