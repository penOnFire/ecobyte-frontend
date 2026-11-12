---
name: EcoByte Circular Tech
colors:
  surface: '#f8faf6'
  surface-dim: '#d9dad7'
  surface-bright: '#f8faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f0'
  surface-container: '#edeeeb'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e1e3df'
  on-surface: '#191c1a'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#f0f1ed'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#2e6a41'
  on-secondary: '#ffffff'
  secondary-container: '#b1f2be'
  on-secondary-container: '#347047'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#ef9900'
  on-tertiary-container: '#5c3800'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#b1f2be'
  secondary-fixed-dim: '#96d5a3'
  on-secondary-fixed: '#00210d'
  on-secondary-fixed-variant: '#12512c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8faf6'
  on-background: '#191c1a'
  surface-variant: '#e1e3df'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.12em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 1.75rem
  space-2xl: 2.5rem
---

## Brand & Style
The design system reflects a modern circular economy ethos: sustainable, transparent, high-trust, and technologically sharp. It transforms physical hardware stewardship, e-waste redemption, and refurbished asset exchanges into an approachable, tactile, and rewarding digital experience.

The visual style blends **Modern Clean Utilitarianism** with **Fresh Bio-Digital Accents**. It relies on crisp typography, generous breathing room, layered card surfaces with subtle mint and pale green undertones, high-contrast dark green functional text, and energetic grass-to-lime green action gradients. The aesthetic avoids murky earth tones in favor of bright, vibrant, life-affirming greens paired with deep forest contrast—communicating vitality, verified chain-of-custody credibility, and effortless circular sustainability.

## Colors
The palette is built around lively eco-greens, deep botanical anchors, and warm off-white canvases:

- **Primary (`#22c55e`)**: Used for primary action affordances, success cues, and dynamic linear gradients (running from `#15803d` through `#22c55e` to `#48bb27`) on prominent pass headers and CTA triggers.
- **Secondary (`#14532d`)**: Deep forest green serving as the anchor for key headings, strong pill badges, verified badges, icon containers, and high-emphasis information rows.
- **Tertiary (`#f59e0b` / `#fef3c7`)**: Warm amber/peach for temporal warnings (e.g., reservation expirations, proof-of-claim hold windows, time-sensitive alerts).
- **Neutral Surface & Base**:
  - Main Canvas: `#f9fbf7` (warm, natural off-white).
  - Mint & Container Tint: `#f0fdf4`, `#dcfce7`, and `#ecfdf5` used for tiered informational callouts, circular impact summaries, and ticket vouchers.
  - Card & Modal Surfaces: `#ffffff`.
  - Body & Label Text: `#191c1a` (deep charcoal-slate, preventing harsh pure-black eye strain).
  - Subdued / Secondary Text: `#526054` and `#718076`.
  - Hairlines & Borders: `#e2e8e0` and `#bbf7d0`.

## Typography
Typography balances accessibility with tech credibility:

- **Plus Jakarta Sans** provides a warm, modern, humanist geometric sans-serif that retains legibility across density tiers and transactional workflows.
- **JetBrains Mono** is reserved exclusively for structured technical identifiers, verification strings, claim voucher numbers (e.g., `ECO-4821`), and serialized hardware IDs (`#CIR-84920`).
- Use tight negative letter-spacing for headlines to project confidence, while maintaining generous 1.4–1.5 line heights across body blocks and informational notes.

## Layout & Spacing
The layout uses a constrained fluid grid system optimized for card stacks, voucher slips, and multi-step verification flows:

- **Mobile Viewport (< 640px)**: 4-column layout with 16px margins and 12px–16px gutters. Single-column card stacking ensures handoff verification and camera controls are reachable with one thumb.
- **Tablet / Desktop Viewport (>= 640px)**: Centered container capped at 480px–540px for transactional mobile pass sheets, or expanding to a 12-column grid (32px margins, 24px gutters) when rendering inventory and dashboard management hubs.
- **Spacing Rhythm**: Component internals use a strict 4px/8px incremental scale (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 14px, `space-lg` = 20px, `space-xl` = 28px). Vertical spacing between distinct functional modules ranges from `space-md` to `space-lg` to maintain quick cognitive scanning.

## Elevation & Depth
Depth is created primarily through tonal surface containment rather than heavy drop shadows:

- **Surface Tiers**:
  - `Level 0`: Canvas background (`#f9fbf7`).
  - `Level 1`: Base cards and containers (`#ffffff`) bounded by a subtle 1px border (`#e4ece1`).
  - `Level 2`: Informational callout containers (`#f0fdf4`, `#dcfce7`, and `#fef3c7`) placed atop white surfaces without borders, using color tone to define boundary.
  - `Level 3`: Active elements, sticky bottom bars, and floating claim tickets.
- **Ambient Shadow System**:
  - Standard Cards: `0 4px 20px -2px rgba(20, 83, 45, 0.05)`.
  - Floating CTAs & Hero Vouchers: `0 10px 25px -4px rgba(21, 128, 61, 0.16)`.
- **Tactile Perforations**: Reservation and pass vouchers leverage scalloped cutouts (`clip-path` or dual-radius masking) on opposing lateral edges accompanied by dashed divider lines to suggest physical reclaim receipts.

## Shapes
The shape system prioritizes rounded, approachable corners that communicate modern consumer hardware design:

- **Outer Enclosures & Cards**: Radius of 16px to 20px (`rounded-lg` / `rounded-xl`).
- **Input Areas & Upload Dropzones**: Radius of 12px to 14px with dashed borders (`1.5px dashed #86efac`).
- **Buttons & Large CTAs**: Soft rounded pills (12px to 14px) or full capsule pills (`rounded-full`) for circular quick-actions.
- **Status Badges, Chips, and Voucher Tags**: Fully rounded pill shapes (`border-radius: 9999px`) to immediately signal interactive tags or verified states.
- **Media Thumbnails & Icon Badges**: Squircle forms (10px–12px radius) with soft background fills.

## Components

### Buttons & Interactive Triggers
- **Primary CTA**: Multi-stop linear gradient (`linear-gradient(135deg, #15803d 0%, #22c55e 50%, #4ade80 100%)` or solid forest-to-lime transition). High-contrast bold white text, accompanied by rightward micro-icons. Height is 48px to 52px with a 12px–14px radius.
- **Secondary / Ghost Button**: White surface with a 1px border (`#bbf7d0`), forest green text (`#14532d`), and a subtle hover fill (`#f0fdf4`).
- **Tertiary Utility Actions**: 36px–40px circular or pill-shaped buttons with light mint backgrounds (`#ecfdf5`) for camera shutter, file picker, and step-back arrows.

### Status Chips & Verification Badges
- **Verified / Ready**: Pale green background (`#dcfce7`), deep forest text (`#166534`), and a 12px checkmark icon.
- **Hold / Urgent Warning**: Pale warm amber (`#fef3c7`), dark amber text (`#92400e`).
- **Hardware Specs / Metadata Pill**: Crisp white background, subtle border (`#d1d5db`), charcoal text (`#191c1a`), with monospaced hardware identifiers.

### Voucher & Ticket Passes
- Vibrant lime-green (`#22c55e`) header featuring centered monospaced claim codes in a recessed white capsule card with copy-to-clipboard affordances.
- Perforated ticket divider with notch indentations and dashed border lines (`#bbf7d0`).
- Lower receipt panel hosting item attributes, timestamp intervals, and collection location coordinates.

### Impact Callout Cards
- Tinted mint-green container (`#ecfdf5`) with a 1px border (`#bbf7d0`).
- Features a dark forest circular emblem icon on the left paired with a circularity metric label (e.g., `-14.8 kg e-waste diverted`) and descriptive helper typography.

### Input Fields & Upload Drag-and-Drop Zones
- **Upload Box**: Light neutral-mint background (`#fbfdfa`) bordered by a `1.5px dashed #86efac` perimeter. Houses an illuminated cloud/camera icon, clear file support hints, and split action buttons (`Take photo` vs. `Upload gallery`).
- **Form Controls**: Rounded text fields (10px radius) with subtle slate outlines (`#e2e8e0`) that transition to focus borders in vibrant emerald green (`#22c55e`) with a 3px soft green glow ring.