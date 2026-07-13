# Product

## Register

brand

## Platform

web

## Users

Indonesian B2B buyers, predominantly aged 30+, in three overlapping segments:

- **Building contractors & project managers** sourcing construction materials for sites and projects.
- **Infrastructure / civil-works procurement** — larger, spec-driven buyers.
- **Government & public-sector procurement officers** (BSM already supplies government; this is a credibility anchor, not a future ambition).

They are time-pressured, evaluation-led, and trust-first. They scan for proof — national reach, government track record, a concrete catalog — before they ever pick up the phone. Language is **Bahasa Indonesia**. Geographic reach is **nationwide: Sabang to Merauke**, explicitly not Java-centric.

## Product Purpose

CV Bangun Sarana Makmur (BSM) is a construction-materials **distributor** that aggregates products from multiple factories (which do not retail directly) into a single **one-stop solution** for contractors and projects. Core catalog: **BRC steel (besi BRC), barbed wire (kawat duri), and guard rail**.

The site must:

1. Position BSM as a trustworthy, nationwide, government-capable **one-stop supplier** — not a generic trader.
2. Make the catalog and the "pooled from factories → one source" value proposition effortless to grasp in seconds.
3. Convert intent into action: channel inquiries to **WhatsApp / email** with zero friction.
4. Publish **readable, credibility-building blog content** that feels safe and expert.

A separate **`/admin` Svelte 5 island** lets non-technical staff manage blog content (CRUD + scheduling) via the GitHub REST API. It is a product/tooling surface and is intentionally secondary to the public brand site.

## Brand Personality

**modern · sleek · trustworthy.**

Confident and precise, never flashy. The client's own brief: "menarik dan modern, tapi tetap mudah dibaca" — attractive and modern, but still easy to read; it should *feel safe*. This is high-trust B2B, not an agency showreel.

## Anti-references

- **The generic "AI cream + serif company-profile template"** — the current baseline (`--bg #fffff8`, Georgia body) is exactly what the brief asks us to move away from. Modern and sleek is the target.
- **Flashy / over-designed agency aesthetics** that sacrifice readability for effect.
- **Stock-photo sameness.** AI-generated project visuals are explicitly welcome, but must be unique and distinct from generic stock — not interchangeable.

## Design Principles

1. **Modern and sleek, but legibility-first.** A 30+ B2B audience must grasp the value in seconds; aesthetics never compromise readability or scannability.
2. **High-trust by default.** Government clients, national reach (Sabang–Merauke), and a concrete catalog earn credibility through clarity and proof — not through decoration or hype.
3. **One-stop framing.** The site should make "pooled from multiple factories" feel like a single, reliable source. Reduce every bit of friction between a buyer's need and the inquiry CTA.
4. **Nationwide, not Java-centric.** Visuals, copy, and proof points signal national coverage; avoid a hyper-local or Java-only feel.
5. **Intuitive where it is a tool.** The `/admin` CMS must be self-explanatory for non-technical staff — obvious actions, no hidden modes.
6. **Improvisable copy.** Wording follows best practice over the old site's literal phrasing (client-approved), while preserving the substance: the products, the one-stop distribution model, and government reach.

## Accessibility & Inclusion

- **WCAG 2.1 AA target.** Body text ≥ 4.5:1, large text ≥ 3:1; affordances must not rely on color alone.
- **Reduced-motion** support for every animation and reveal.
- **Bahasa Indonesia readability:** clear information hierarchy, controlled line length (~65–75ch), and a legible type scale tuned for 30+ readers — no cramped display headings.
- **Obvious, keyboard-reachable CTAs** (WhatsApp / email) — the primary conversion path must be unmistakable and operable without a mouse.
