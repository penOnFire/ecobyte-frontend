---
name: Circularity Enterprise Console
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4944'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7973'
  outline-variant: '#bec9c2'
  surface-tint: '#1b6b51'
  primary: '#004532'
  on-primary: '#ffffff'
  primary-container: '#065f46'
  on-primary-container: '#8bd6b7'
  inverse-primary: '#8bd6b6'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#5e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#804300'
  on-tertiary-container: '#ffb87e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f2d1'
  primary-fixed-dim: '#8bd6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system serves an enterprise-grade circular economy and electronics lifecycle platform. Its primary audience comprises logistics managers, compliance officers, certified refurbishers, and sustainability auditors who process high volumes of serialized hardware daily.

The visual style merges **Corporate / Modern Precision** with **Tactile Technical Minimalism**:
- **Demeanor:** Pragmatic, responsible, analytical, and authoritative. It removes arbitrary decoration in favor of scannability, dense metrics, and explicit state signaling.
- **Tone:** Technical ecological infrastructure. Rather than generic natural greens or light whimsical themes, it leverages an industrial, high-density computing aesthetic grounded in slate neutrals and crisp emerald indicators.
- **Visual Tension:** Dense data grids and high-frequency operational controls are balanced by razor-sharp borders, deliberate whitespace increments, and strict typographic hierarchy.

## Colors

The palette balances clinical precision with purposeful, semantic environmental cues:

- **Primary (`#065F46` - Deep Emerald):** Represents certified lifecycle events, validated reuse, authentic recovery pathways, and high-level platform commands.
- **Secondary (`#0D9488` - Deep Teal):** Used for analytical visualizations, interactive filtering layers, batch processing tokens, and secondary telemetry tags.
- **Tertiary (`#D97706` - Warm Amber):** Reserved for triage workflows, chain-of-custody handoffs awaiting inspection, and quarantine holds.
- **Critical / High Risk (`#E11D48` - Crimson Rose):** Distinct from the brand colors; deployed strictly for hazardous component flags, battery breach hazards, and total destruction/smelting mandates.
- **Neutral Surface Palette (Slate / Zinc Matrix):**
  - App Canvas: `#F8FAFC`
  - Elevated Surface: `#FFFFFF`
  - Recessed / Table Well: `#F1F5F9`
  - Structural Divider: `#E2E8F0`
  - High-Contrast Border: `#CBD5E1`
  - Text Primary: `#0F172A`
  - Text Muted: `#475569`

## Typography

Typography prioritizes tabular clarity and high readability under rapid visual scans:

- **Typeface:** Inter is utilized across all tiers, utilizing its open counters, tall x-height, and superior tabular numeral features.
- **Numerical Alignment:** Tabular lining figures (`font-variant-numeric: tabular-nums`) are enforced across all telemetry fields, serial tracking logs, mass/tonnage metrics, and asset counts.
- **Hierarchy Structure:** Heading scales remain restrained to conserve screen real estate for workflow tables and data-dense dashboards. Micro-labels (`label-sm`, `label-md`) use uppercase formatting with positive tracking for manifest badges, compliance classes, and asset status markers.

## Layout & Spacing

The layout operates on a compact, predictable 4px base rhythm designed for complex portal views:

- **System Structure:** A fixed fluid grid supporting a persistent collapsed/expandable utility sidebar (64px to 240px) paired with an elastic multi-column content area constrained to a maximum width of `1600px` for optimal tabular reading lines.
- **Grid Mechanics:** 
  - **Desktop (1200px+):** 12-column layout with `gutter-desktop` (24px) and `margin-desktop` (32px).
  - **Tablet (768px - 1199px):** 8-column layout with 16px gutters and 24px margins.
  - **Mobile (<768px):** 4-column layout with 12px gutters and 16px margins, reflowing side-by-side metric tiles into vertical accordion cards.
- **Density Guidelines:** Component internal padding uses compact steps (`space-sm` for table cells and form controls) to preserve high visual density without creating target collision.

## Elevation & Depth

To avoid visual noise in data-heavy screens, this design system rejects heavy floating drop shadows and blur layers in favor of **structural containment and planar layering**:

- **Low-Contrast Structural Borders:** Depth is defined by sharp 1px borders using `#E2E8F0` on `#FFFFFF` surfaces. Active, editable, or hovered panels shift to `#CBD5E1`.
- **Surface Elevation Hierarchy:**
  - **Level 0 (Canvas):** Base background `#F8FAFC`.
  - **Level 1 (Card & Module Layer):** Solid `#FFFFFF` bordered by `#E2E8F0`. No shadow.
  - **Level 2 (Active/Flyout Panels & Drawers):** `#FFFFFF` with a single directional ambient shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`.
  - **Level 3 (Modal Dialogs & Manifest Overlays):** `#FFFFFF` with `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` over a backdrop tint of `rgba(15, 23, 42, 0.4)`.
- **Recessed Areas:** Data tables and terminal logs rest on recessed wells (`#F1F5F9`) with inset styling to clearly differentiate static boundaries from interactive elements.

## Shapes

The geometric framework communicates industrial reliability and structural rigidity:

- **Corner Radius Scale:** Built upon `roundedness: 1` (0.25rem / 4px base radius).
  - Badges, status chips, standard buttons, text inputs: `4px` (`rounded`).
  - Cards, content tiles, flyout inspection panels: `8px` (`rounded-lg`).
  - Modal viewports, central manifest wrappers: `12px` (`rounded-xl`).
- **Interactive Predictability:** Elements maintain geometric consistency; pills and high-curvature radiuses are strictly prohibited to avoid playful, non-industrial connotations.

## Components

### Buttons
- **Primary:** Background `#065F46`, text `#FFFFFF`, border none. Hover state `#047857`. Focus ring 2px `#0D9488` offset by 2px. Compact padding: 6px 12px for desktop data bars.
- **Secondary / Outline:** Background `#FFFFFF`, text `#0F172A`, border 1px solid `#CBD5E1`. Hover: background `#F8FAFC`, border `#94A3B8`.
- **Destructive (Hazard/Disposal):** Background `#FFF1F2`, text `#E11D48`, border 1px solid `#FECDD3`. Hover: background `#FFE4E6`.

### Chips & Semantic Status Badges
- Built with 10px uppercase typography (`label-sm`), 2px 6px padding, and subtle tinted borders:
  - **Awaiting Inspection / Triage:** Background `#FEF3C7`, text `#92400E`, border `#FDE68A`.
  - **Reuse Hub / Refurb Ready:** Background `#ECFDF5`, text `#065F46`, border `#A7F3D0`.
  - **Hazard / Smelt Mandate:** Background `#FFF1F2`, text `#BE123C`, border `#FECDD3`.
  - **Neutral / Archived:** Background `#F1F5F9`, text `#475569`, border `#E2E8F0`.

### Data Tables (High-Density)
- Headers: `#F8FAFC`, font weight 600, uppercase 11px (`label-md`), text `#475569`, bottom border 1px solid `#CBD5E1`.
- Rows: Background `#FFFFFF`, height 40px, padding horizontal 12px, bottom border 1px solid `#F1F5F9`. Hover state `#F8FAFC`. Tabular numeric alignment on all hardware IDs, weight measures, and yield percentages.

### Inspection Cards
- Layout modular container featuring a solid 1px `#E2E8F0` border, `#FFFFFF` interior, and a 4px left-accent vertical rule mapped to asset condition (Emerald for Grade A/B refurb, Amber for diagnostic queue, Rose for Hazmat/Shredding).
- Internal breakdown: split header (Asset ID + Status Chip), primary body displaying specification metadata in key-value pairs, and sticky bottom micro-actions (Print Barcode, Reassign Lot, Flag Hazard).

### Form Inputs & Checkboxes
- **Inputs:** Height 36px, font size 13px, background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`. Inner padding: 8px 12px. Placeholder `#94A3B8`. Active focus: border `#065F46` with 1px outline.
- **Checkboxes & Radios:** 16px square/circle with 1px `#CBD5E1` border. Checked fill `#065F46` with white SVG checkmark/dot.