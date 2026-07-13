---
name: CV Bangun Sarana Makmur — Web
description: Modern, sleek, high-trust B2B construction-materials distributor (BRC steel, barbed wire, guard rail) serving all Indonesia.
colors:
  primary: "#e22b1e"
  primary-deep: "#b91c12"
  primary-tint: "oklch(96.5% 2.2% 25)"
  ink: "#15171c"
  ink-soft: "#2b2f38"
  muted: "#5b6470"
  bg: "#ffffff"
  surface: "#f6f7f9"
  border: "#e6e8ec"
  border-strong: "#d4d8de"
typography:
  display:
    fontFamily: "Sora, 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Sora, 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Sora, 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  "2xl": "64px"
  "3xl": "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "13px 26px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "13px 26px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px 25px"
---

# Design System: CV Bangun Sarana Makmur — Web

## 1. Overview

**Creative North Star: "Confident infrastructure, modernized."**

BSM is a construction-materials distributor that pools products from multiple factories into a single reliable one-stop source for contractors and projects. The visual system should feel engineered and exact — like Cloudflare-grade B2B: clean geometric type, a single committed accent, sharp corners, and precise layout — while staying legible-first for a 30+ procurement audience that scans for proof (national reach, government credibility, a concrete catalog) before it ever calls.

This system explicitly **rejects the legacy baseline** (cream `#fffff8` + Georgia serif, Inter-as-body, gray section blocks, and the 1px-border-plus-soft-shadow "ghost card" everywhere) and any flashy agency aesthetic. Modernized in reference to clean B2B tech sites: type-led, committed accent, restrained-but-bold, real product imagery.

**Key Characteristics:**
- Geist body + Sora display — a clean geometric-grotesk pairing that reads modern, not generic.
- One committed brand red (`#e22b1e`) as the only chromatic voice; used as signal (CTAs, key marks, links) and as a bold full-bleed CTA band.
- Sharp, confident radii (4–10px). No pill-rounded cards.
- Real product imagery (precise SVG technical illustrations of BRC mesh, barbed wire, guard rail) instead of placeholder text panels.
- Editorial product rows (alternating image/text) instead of identical card grids.
- Soft, low-blur elevation only; the "ghost card" (border + wide soft shadow) is banned.

## 2. Colors

A cool, near-neutral system on graphite and white, with one saturated brand red as the only chromatic voice. The red is committed — it appears as both a precise signal and a bold full-bleed band — so it reads as confident, not decorative.

### Primary
- **BSM Red** (`#e22b1e`): the brand's anchor and only accent. CTAs, active nav state, key data marks, links, and the full-bleed CTA band.
- **BSM Red Deep** (`#b91c12`): hover/active state of the primary red.
- **BSM Red Tint** (`oklch(96.5% 2.2% 25)`): faint wash for the hero glow and focus rings.

### Neutral
- **Graphite Ink** (`#15171c`): primary text, headings, footer, and dark sections. A cool near-black.
- **Ink Soft** (`#2b2f38`): nav links and long-form prose.
- **Slate Muted** (`#5b6470`): secondary text, captions, meta. Must hold ≥4.5:1 on white.
- **Pure White** (`#ffffff`): page background.
- **Cool Mist** (`#f6f7f9`): alternating section background and image surface. A faint cool off-white, never warm/beige.
- **Hairline** (`#e6e8ec`): borders, dividers.
- **Hairline Strong** (`#d4d8de`): ghost-button borders, input strokes — slightly darker for definition.

### Named Rules
**The One Signal Rule.** Brand red is the only chromatic accent. Used on CTAs, active nav, key marks, links, and the full-bleed CTA band.

**The Cool-Only Rule.** Every neutral leans cool (graphite/gray with a blue undertone). No warm cream, no beige, no paper.

## 3. Typography

**Display Font:** Sora (with `Segoe UI`, system-ui fallback)
**Body Font:** Geist (with system-ui fallback) — replaced Inter to drop the generic default.
**Label Font:** Geist (weight 600, slightly negative-tracked)

**Character:** A confident geometric-grotesk display (Sora) paired with a clean, modern neo-grotesk body (Geist). Sora gives headings an engineered, infrastructure-grade feel; Geist keeps long Bahasa paragraphs effortless to read at 30+ reader ages. The pairing contrasts on axis (display grotesk vs body grotesk, distinct families) and reads as one intentional, contemporary system.

### Hierarchy
- **Display** (600, `clamp(2.4rem, 5.4vw, 4.25rem)`, line-height 1.02, letter-spacing -0.035em): hero. Ceiling ≤4.25rem.
- **Headline** (600, `clamp(1.9rem, 3.6vw, 2.75rem)`, line-height 1.08, letter-spacing -0.025em): section titles (h2).
- **Title** (600, `clamp(1.5rem, 2.6vw, 2rem)`, line-height 1.1, letter-spacing -0.02em): block titles (h3).
- **Body** (400, 1.0625rem, line-height 1.6): all running text. Cap prose at ~70ch.
- **Eyebrow** (600, 0.78rem, letter-spacing 0.08em, uppercase, red): a single deliberate kicker used on section heads — voice, not per-section scaffolding.

### Named Rules
**The Eyebrow-As-Voice Rule.** A small uppercase tracked kicker (red) may sit above a section heading as a deliberate brand system. It is used sparingly and consistently — never as a mandatory label on every block.

## 4. Elevation

Flat at rest; depth appears on state change only. A single, low-blur shadow carries a faint cool tint. The "ghost card" (1px border + wide soft shadow as decoration on the same element) is banned — pick one.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgba(21,23,28,0.04), 0 8px 24px rgba(21,23,28,0.06)`): hero image and product media only. ≤8px blur — never the 16–40px ghost-card.

### Named Rules
**The No-Ghost-Card Rule.** Never pair a 1px border with a wide soft shadow (≥16px blur) as decoration on the same element. Use a hairline border alone (cards, regions) or a defined low-blur shadow alone (hero/media).

## 5. Components

### Buttons
- **Shape:** sharp (6px / `rounded.md`), comfortable padding (13px 26px).
- **Primary:** BSM Red background, white label (weight 600). The strongest signal on the page.
- **Hover / Focus:** background → BSM Red Deep; subtle `-1px` lift; `:focus-visible` 2px red ring offset. Transition 200ms ease-out.
- **Ghost:** transparent background, Ink text, 1px Hairline-Strong border; hover darkens border to Ink. Secondary actions beside a primary CTA.
- **On-dark ghost:** white text + translucent white border (CTA band, footer).

### Navigation
- **Style:** sticky top, white at 82% with `backdrop-filter: blur(12px)` saturation; transparent bottom border that becomes a Hairline once scrolled. Geist Ink-Soft links with a red underline that scales in on hover/active. CTA (WhatsApp) always visible.
- **Mobile:** collapses to a top bar with a simple menu; never a clipped overflow drawer.

### Product Rows (signature component)
Editorial alternating image/text rows replace the identical card grid. Each row: a precise product SVG illustration in a 10px-radius media frame (hairline border, `section-soft` backdrop) beside a red index kicker, Title, a one-line spec in Slate Muted, and a primary "Minta Penawaran" button. Rows alternate media left/right on desktop. This is the catalog workhorse and reads as considered, not templated.

### Region Grid / Tags
- **Regions:** Cool Mist tiles, 6px radius, Hairline border; lift 2px on hover. No colored stripe.
- **Eyebrow / kicker:** red uppercase tracked label — voice, not scaffolding.

## 6. Do's and Don'ts

### Do:
- **Do** keep body text in Graphite Ink on white/Cool Mist; secondary text in Slate Muted that clears 4.5:1 — verify.
- **Do** use BSM Red as the single signal: CTAs, active nav, key marks, links, and the full-bleed CTA band.
- **Do** cap prose at ~70ch and hero display at ≤4.25rem for a 30+ B2B reader.
- **Do** use sharp radii (4–10px); the full-bleed CTA band may use pill buttons.
- **Do** use precise product illustrations (BRC mesh, barbed wire, guard rail) as real imagery — distinct, on-brand, never placeholder text.
- **Do** write direct, proof-led Bahasa Indonesia copy (SNI, national delivery, 10+ years).

### Don't:
- **Don't** use the legacy cream + Georgia, Inter-as-body, gray section blocks, or the ghost-card (border + wide soft shadow).
- **Don't** use flashy agency aesthetics that sacrifice readability.
- **Don't** use stock-photo sameness or placeholder text panels where product imagery belongs.
- **Don't** use a colored left/right border stripe >1px as an accent — use full borders, tints, or icons.
- **Don't** use gradient text, glassmorphism (except the subtle header blur), or pill-rounded cards (>10px).
- **Don't** gate any content's visibility on a scroll/load animation; reveals enhance an already-visible default.
- **Don't** let motion run without a `prefers-reduced-motion` alternative (crossfade or instant).
- **Don't** introduce a second chromatic accent — graphite/white/red is the whole palette.
