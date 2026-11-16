# EcoByte Landing Page — Design & Execution Specification

**Target Codebase:** `/home/seanizonfire/Desktop/Capstone/Ecobyte/frontend`  
**Owner (Implementation):** Argon  
**Status:** Ready for Implementation  
**Entry Route:** `/` (`src/pages/LandingPage.tsx`)

---

## 1. Executive Summary & Tech Stack Constraints

This specification defines the complete visual design, interaction architecture, copy, asset bindings, and file structure for EcoByte's public landing page at `/`. It translates the tactile physicality, illustrated atmospheric hero, live phone-frame storytelling, and crisp 2px-bordered craft of `https://wikaph.com/` into EcoByte's authentic civic e-waste domain in **Barangay Commonwealth, Quezon City**.

### Verified Stack & Compiler Guardrails
From `package.json`, `tsconfig.app.json`, `.oxlintrc.json`, and `index.html`:
- **Framework:** React `19.3.1`, TypeScript `~7.0.2`, Vite `8.3.6`, React Router DOM `7.18.5`.
- **UI & Styling:** `@mui/material` `9.5.0`, `@mui/icons-material` `9.5.0`, `@emotion/react` `11.14.0`, `@emotion/styled` `11.14.1`.
- **No Tailwind CSS:** Tailwind is **not** installed in `package.json`. Do **not** emit Tailwind utility classes. Use a dedicated stylesheet (`src/components/landing/landing.css`) alongside MUI `<Box sx={...}>` and `<Typography sx={...}>`.
- **Theme Interaction (`src/theme/theme.ts`):** `MuiButton` globally sets `borderRadius: 9999` and `boxShadow: 'none'`. For landing-page 3D tactile push buttons, render native `<button>` or React Router `<Link>` elements styled via `.eco-btn` classes in `landing.css` (or `ButtonBase` with explicit classNames) rather than fighting `MuiButton` defaults.
- **TypeScript Rules (`tsconfig.app.json`):**
  - `verbatimModuleSyntax: true` — always use `import type { ... }` for types (`FC`, `ReactNode`, etc.).
  - `erasableSyntaxOnly: true` — no TS `enum` or constructor parameter properties; use union string literals and `as const` objects.
  - `noUnusedLocals: true` & `noUnusedParameters: true` — zero dead imports or unused props.
- **Oxlint Rules (`.oxlintrc.json`):**
  - `react/rules-of-hooks: error`
  - `react/only-export-components: warn` — keep all static data arrays, types, and device/site tables inside `src/components/landing/landingData.ts` so `.tsx` component files export only React components.

---

## 2. Visual Identity, Design Tokens & Anti-AI-Slop Guardrails

### 2.1 Color Palette (CSS Custom Properties in `landing.css`)
Grounded in `src/theme/theme.ts` and expanded with tactile 3D surface/lip tokens:

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--eco-moss` | `#4f5f4b` | Primary brand surface, primary 3D button fill, active indicators |
| `--eco-moss-deep` | `#2d3e2c` | Primary 3D button bottom lip (`border-bottom` / `box-shadow`), dark CTA banner base |
| `--eco-moss-hover` | `#43523f` | Hover fill for Forest Moss primary buttons |
| `--eco-moss-tint` | `#eef3ed` | Soft sage surface tint for active cards, marquee pills, and Pilot Card 1 |
| `--eco-lime` | `#abf06b` | Electric Lime high-contrast accent, Hero & Bottom Banner 3D CTA |
| `--eco-lime-lip` | `#6ea832` | Electric Lime 3D button bottom lip |
| `--eco-lime-tint` | `#e8ffbf` | Verified / Available status pill background |
| `--eco-alabaster` | `#faf8f5` | Warm Alabaster primary canvas background (matches `theme.ts`) |
| `--eco-white` | `#ffffff` | Crisp card, phone-bezel inner screen, and section surfaces |
| `--eco-ink` | `#0f172a` | Deep Slate primary headlines, phone bezel frame, dark UI text |
| `--eco-ink-muted` | `#475569` | Muted Slate body copy (WCAG AA compliant on `#faf8f5` & `#ffffff`) |
| `--eco-ink-subtle` | `#64748b` | Secondary metadata, timestamps, distance labels |
| `--eco-border` | `#dce4dc` | Crisp 2px tactile card & pill borders |
| `--eco-border-lip` | `#c1cdc1` | Tactile white/tint card bottom lip (`border-bottom: 4px solid`) |
| `--eco-amber` | `#d97706` | Amber diagnostic warning & lithium battery safety alert |
| `--eco-amber-bg` | `#fef3c7` | Soft amber diagnostic banner background (`border: 1.5px solid #fde68a`) |
| `--eco-sky-top` | `#d7ece0` | Hero daylight upper sky wash (fresh Quezon City morning air) |
| `--eco-sky-mid` | `#e7f2ea` | Hero mid atmospheric transition |
| `--eco-sky-bottom` | `#faf8f5` | Hero lower transition dissolving into the Alabaster page canvas |

### 2.2 Typography System
All 4 fonts are already loaded in `index.html`:
- **Display Headlines (`h1`, `h2`, `h3`):** `'Rethink Sans', sans-serif`
  - Weight `800`, tight tracking `-0.025em` (`h1`) / `-0.02em` (`h2`, `h3`), line-height `1.05`–`1.15`.
- **UI Controls, Cards & Body Copy:** `'Quicksand', 'Inter', sans-serif`
  - Body prose (`1rem` / `1.0625rem`, line-height `1.6`, weight `500`–`600`) uses `'Inter'` or `'Quicksand'` consistently; UI pills/buttons use `'Quicksand'` weight `700`.
- **Codes & Hardware Telemetry ONLY:** `'JetBrains Mono', monospace`
  - Used strictly for real pass/session codes (`#ECO-4821`, `#SCAN-9042`), battery percentages (`68%`, `85%`), distances (`0.8 km`), and coordinates. **Never** use monospace for decorative eyebrow tags.

### 2.3 Tactile 3D Component Rules
1. **3D Push Buttons (`.eco-btn`):**
   - `border-radius: 14px`
   - `border: 2px solid transparent` with `border-bottom-width: 5px` (or `box-shadow: 0 4px 0 <lip-color>`)
   - `transition: transform 0.12s cubic-bezier(0.22, 0.9, 0.26, 1), border-bottom-width 0.12s ease, background-color 0.15s ease`
   - `:active`: `transform: translateY(3px); border-bottom-width: 2px;` (physically depresses into its lip)
   - `:focus-visible`: `outline: 3px solid #abf06b; outline-offset: 2px;` (or `#4f5f4b` on lime buttons)
2. **Tactile Surface Cards (`.eco-card`):**
   - `background: #ffffff; border: 2px solid var(--eco-border); border-bottom: 4px solid var(--eco-border-lip); border-radius: 20px;`
   - Interactive selector cards add `cursor: pointer`, hover border `#4f5f4b`, and active state background `--eco-moss-tint` with `border-color: #4f5f4b; border-bottom-color: #2d3e2c`.

### 2.4 Strict Anti-AI-Slop Guardrails (Mandatory)
Argon must enforce all of the following during implementation:
- **Forbidden Visuals:** NO purple/indigo SaaS gradients, NO warm cream + terracotta (`#D97757`), NO `#0B0B0B` acid-green hacker/terminal dark mode, NO floating blurred glassmorphism blobs.
- **Forbidden Copy & Typography Tricks:**
  - NO tracked-out ALL-CAPS eyebrow labels above every section heading.
  - NO dot-joined `A · B · C` meta strings (use separate pills or natural prose).
  - NO `WORD — fragment` spaced em-dash headings.
  - NO single italicized or differently colored accent words crammed mid-headline.
  - NO generic sustainability filler ("Empowering the future of sustainable innovation", "Revolutionizing green tech").
  - NO fabricated user testimonials or stock avatar portraits.
- **Sequential Numbering Rule:** Use `01`, `02`, `03` **only** in Showcase B (the actual 3-step Verified Recovery Loop). Do not decorate non-sequential cards with arbitrary numbers.
- **Zero Broken Assets:** Every image must be a static ES import from `@/assets/ui/...`. Zero external URLs, zero `placeholder.com`, zero empty image boxes.

---

## 3. Asset Inventory & Exact Vite Import Bindings

All assets live in `src/assets/ui/` and are imported via `@/assets/ui/<filename>`:

| File | Assigned Landing Page Usage |
| :--- | :--- |
| `ecobyte_logo.svg` | Navbar brand mark, Footer brand mark, in-phone top header |
| `thinkpad.jpeg` | Device Switcher #1 (`Lenovo ThinkPad T480`) + Hero proof thumbnail |
| `thinkpad_detail.jpeg` | Device Switcher #1 detail strip & Bottom CTA PhoneFrame screen |
| `galaxy_s10.jpeg` | Device Switcher #2 (`Samsung Galaxy S10`) + Hero proof thumbnail |
| `ipad.jpeg` | Device Switcher #3 (`iPad Air`) + Hero rising phone preview + Hero proof thumbnail |
| `keychron.jpeg` | Device Switcher #4 (`Keychron K2`) + Walkthrough Tab 2 (`#ECO-4821`) + Hero proof thumbnail |
| `charger.jpeg` | Device Switcher #5 (`65W GaN Charger`) |
| `diagnostic_view.jpeg` | Showcase A (`6-Angle AI Device Diagnostic`) + Walkthrough Tab 1 (`Diagnostic Report`) |
| `angle_front.jpeg` | Showcase A 6-angle thumbnail slot (`Front`) |
| `angle_back.jpeg` | Showcase A 6-angle thumbnail slot (`Back`) |
| `angle_left.jpeg` | Showcase A 6-angle thumbnail slot (`Left`) |
| `angle_right.jpeg` | Showcase A 6-angle thumbnail slot (`Right`) |
| `camera_viewfinder.svg` | Optional subtle viewfinder reticle overlay in Showcase A / Hero phone screen |
| `dropoff_map.svg` | Showcase C (`Commonwealth 9-Area Drop-Off Finder`) + Walkthrough Tab 3 (`Barangay Drop-Off`) |

---

## 4. Layout Grid, Breakpoints & Section-by-Section Specification

Global page wrapper: `<Box component="main" className="eco-landing-root">` on `#faf8f5`, `overflow-x: clip` (so sticky navbar works while horizontal hero clouds/marquees never create horizontal scrollbars).  
Standard inner container: `max-width: 1200px`, centered, horizontal padding `20px` (`xs`), `32px` (`md`), `40px` (`lg`).

---

### Section 1: Sticky Tactile Navbar (`LandingNavbar.tsx`)
- **Positioning:** `position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 72px;`
- **Scroll Behavior:** Track `window.scrollY > 16` via passive `scroll` listener.
  - At top (`!scrolled && !mobileMenuOpen`): `background-color: transparent; border-bottom: 2px solid transparent;`
  - Scrolled or drawer open: `background-color: #ffffff; border-bottom: 2px solid #dce4dc; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);`
- **Left Brand:** Clickable link scrolling to top (`#top`): `ecobyte_logo.svg` (`36px × 36px`, `border-radius: 10px`) + `EcoByte` (`Rethink Sans`, `800`, `1.35rem`, `#0f172a`).
- **Center Anchor Links (`display: none` below `1024px`, `display: flex` at `>= 1024px`, `gap: 28px`):**
  1. `How It Works` -> `#how-it-works`
  2. `AI Triage` -> `#ai-triage`
  3. `Reuse Hub` -> `#device-switcher` (or `#reuse-hub`)
  4. `Commonwealth Map` -> `#commonwealth-map`
  5. `Commonwealth Program` -> `#pilot` (keep `id="pilot"` anchor; label can read `Barangay Program` or `Barangay Pilot`)
  - Styling: `'Quicksand'`, `700`, `0.9375rem`, `#334155`, hover `#4f5f4b`, smooth scroll with CSS `scroll-margin-top: 88px` on every target section.
- **Right CTAs (Desktop `>= 640px`):**
  - `Sign In` -> `<RouterLink to="/signin">` styled as tactile ghost link (`#0f172a`, `'Quicksand'`, `700`, `0.9375rem`, padding `8px 14px`, hover `#eef3ed`, radius `12px`).
  - `Scan a Device` -> `<RouterLink to={getAuthHref('/scan')}>` using `.eco-btn .eco-btn-moss` (`padding: 10px 18px`, `font-size: 0.875rem`).
- **Mobile Hamburger Drawer (`< 1024px`):**
  - Hamburger button (`42px × 42px`, `2px solid #dce4dc`, `#ffffff`, radius `12px`, `aria-expanded={mobileMenuOpen}`, `aria-controls="eco-mobile-nav"`).
  - Drawer container uses CSS grid row collapse (`grid-template-rows: 0fr` -> `1fr`, `transition: grid-template-rows 0.28s cubic-bezier(0.22, 0.9, 0.26, 1)`) and sets `inert` attribute when closed (`!mobileMenuOpen`) so hidden links are unreachable by keyboard Tab.
  - Lists the 5 anchor links (closing drawer on click) + full-width `Sign In` (`/signin`) and `Scan a Device` (`getAuthHref('/scan')`) buttons on `< 640px`.

---

### Section 2: Scenic Illustrated Hero + Rising Phone Mockup (`HeroScenicIllustration.tsx` + `PhoneFrame.tsx`)
- **Container:** `<header id="top" className="eco-hero">`
  - Background gradient: `linear-gradient(180deg, #d7ece0 0%, #e7f2ea 58%, #faf8f5 100%)`
  - Padding top: `112px` (`xs`), `128px` (`lg`); padding bottom: `0` on desktop (so the rising phone anchors cleanly into the bottom horizon/divider) or `56px` on mobile.
  - `overflow: hidden; position: relative;`
- **Layered Custom SVG Scenic Illustration (`HeroScenicIllustration.tsx`, `aria-hidden="true"`):**
  - **Layer 1 (`z-index: 1`):** Sky Cloud Ribbon — seamless 200%-width duplicated inline SVG cloud band scrolling horizontally (`animation: eco-cloud-sky 38s linear infinite`) paired with subtle vertical bob (`eco-cloud-float 5s ease-in-out infinite`).
  - **Layer 2 (`z-index: 2`):** Mid-Horizon Cloud Ribbon — second parallax cloud SVG scrolling in opposite or faster phase (`animation: eco-cloud-mid 24s linear infinite`).
  - **Layer 3 (`z-index: 3`):** Distant Quezon City & Commonwealth Ridge Silhouette — soft sage hills (`#c7dcc9`) and clean civic roof silhouettes (Barangay Hall / MRT-7 elevated span / neighborhood trees in `#9eb99e` and `#78957a`) anchored across the bottom `45%` of the hero.
  - **Layer 4 (`z-index: 4`):** Foreground Barangay Green Canopy — stylized crisp flat-vector acacia/narra tree clusters (`#4f5f4b` & `#6ea832` leaf highlights) framing the left and right edges without obscuring text.
- **Hero Content Grid (`z-index: 10; position: relative`):**
  - Desktop (`>= 1024px`): 2-column grid `grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); align-items: end; gap: 48px;`
  - Mobile/Tablet (`< 1024px`): 1-column centered stack, copy first, rising phone below.
- **Left Column Copy & Actions:**
  - **Headline (`h1`):**
    ```
    Give Old Tech
    A Second Life.
    ```
    - `'Rethink Sans'`, `800`, `clamp(2.5rem, 5.2vw, 4.25rem)`, line-height `1.04`, tracking `-0.025em`, `#0f172a`.
  - **Subcopy:**
    `Scan a laptop, phone, or charger in six angles, verify battery safety in seconds, and drop it off or claim working gear across Barangay Commonwealth.`
    - `'Inter'`, `500`, `clamp(1rem, 1.5vw, 1.1875rem)`, line-height `1.6`, `#334155`, `max-width: 540px`, `margin-top: 20px`.
  - **Primary Action Row (`margin-top: 28px`, flex-wrap `gap: 14px`):**
    1. `Start 6-Angle Scan` -> `getAuthHref('/scan')` (`.eco-btn .eco-btn-lime`, large `padding: 14px 26px`, `#abf06b` fill, `#6ea832` 5px bottom lip, `#0f172a` bold text + camera/arrow icon).
    2. `Browse Reuse Hub` -> `getAuthHref('/reuse')` (`.eco-btn .eco-btn-white`, `padding: 14px 22px`, `#ffffff` fill, `2px solid #dce4dc`, `5px` `#c1cdc1` bottom lip).
  - **Secondary Inline Link (`margin-top: 14px`):**
    `Already have a resident or MRF account? Sign In ->` (`/signin`, `#2d3e2c`, weight `700`, underline on hover).
  - **Resident & Device Proof Strip (`margin-top: 28px; padding-bottom: 48px`):**
    - Overlapping 4-thumbnail cluster (`38px × 38px`, `border-radius: 10px`, `border: 2px solid #ffffff`, `margin-left: -10px` overlap): `thinkpad.jpeg`, `galaxy_s10.jpeg`, `ipad.jpeg`, `keychron.jpeg`.
    - Accompanying copy: `9 Barangay Eco-Depots serving Commonwealth, Quezon City` (`'Quicksand'`, `700`, `0.875rem`, `#2d3e2c`).
- **Right Column — Rising Phone Mockup (`PhoneFrame.tsx`):**
  - Entry animation class `.eco-slide-up-phone`: `animation: eco-slide-up-phone 0.8s cubic-bezier(0.22, 0.9, 0.26, 1) 0.15s both;`
  - Anchored flush to the bottom edge of the hero on desktop (`border-bottom-left-radius: 0; border-bottom-right-radius: 0;` or subtle bottom overlap into the next section's border) like Wika's hero phone.
  - **Inside the Hero Phone Screen:** A crisp live EcoByte Dashboard & Active Triage snapshot:
    - Top bar: `ecobyte_logo.svg` + `Commonwealth Hub` + green `Hub Live` `StatusBadge`.
    - Active pass card: `Locker Pass #ECO-4821` (`JetBrains Mono`) + `Keychron K2 V2` thumbnail (`keychron.jpeg`) + `Area 1 Eco-Hub`.
    - Latest verified reuse card: `iPad Air 64GB` (`ipad.jpeg`), `100% Functional, ready for resident claim`, `+150 EcoPoints`.
    - Mini `StepperTracker` showing Step 3 (`Scheduled`).

---

### Section 3: Horizontal Device Category Bar
- **Background:** `#ffffff`, `border-top: 2px solid #dce4dc`, `border-bottom: 2px solid #dce4dc`, `padding: 20px 0`.
- **Layout:** Centered horizontal flex row (`flex-wrap: wrap` on desktop, horizontal scroll snap or neat wrap on mobile, `gap: 10px`).
- **6 Tactile Category Pills:**
  1. `Laptops & PCs` (`LaptopMacRoundedIcon`) -> selects `thinkpad-t480` & scrolls to `#device-switcher`
  2. `Smartphones` (`SmartphoneRoundedIcon`) -> selects `galaxy-s10` & scrolls to `#device-switcher`
  3. `Tablets` (`TabletMacRoundedIcon`) -> selects `ipad-air` & scrolls to `#device-switcher`
  4. `Keyboards` (`KeyboardRoundedIcon`) -> selects `keychron-k2` & scrolls to `#device-switcher`
  5. `Chargers & Cables` (`PowerRoundedIcon`) -> selects `gan-charger-65w` & scrolls to `#device-switcher`
  6. `Batteries & E-Waste` (`BatteryAlertRoundedIcon`) -> scrolls smoothly to `#ai-triage` (Showcase A: lithium battery safety check)
- **Active/Hover Style:** `background: #faf8f5`, `border: 2px solid #dce4dc`, `border-bottom: 3px solid #c1cdc1`, `border-radius: 9999px`, `padding: 8px 16px`, `'Quicksand'` `700` `0.875rem`. Active pill shifts to `#eef3ed` with `#4f5f4b` border.

---

### Section 4: Quezon City & Commonwealth Marquee ("Active Across Commonwealth")
- **Background:** `#ffffff`, `padding: 64px 0 56px`.
- **Header:** Centered `h2`: `Active Across Commonwealth` (`'Rethink Sans'`, `800`, `clamp(1.75rem, 3vw, 2.35rem)`, `#0f172a`) + 1-line subtitle: `Nine neighborhood eco-depots, 24/7 Smart Lockers, and MRF Central connected in one Barangay Commonwealth loop.` (`#475569`).
- **2-Row Edge-Masked Marquee (`.eco-marquee-row`):**
  - Mask: `-webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);`
  - Track duplicates its badge list (`[...items, ...items]`) with `aria-hidden="true"` on the cloned half. Pause on `:hover`.
  - **Row 1 (scrolls left `44s linear infinite`):**
    - `Area 1 • Brgy Hall Complex`
    - `Area 2 • Lupang Pangako`
    - `Area 3 • Payatas Border`
    - `Area 4 • Don Fabian / Litex`
    - `Area 5 • Commonwealth Market / MRT-7`
    - `Area 6 • Pilot Area Eco-Depot`
    - `Area 7 • Kasunduan / Batasan Rd`
  - **Row 2 (scrolls right `48s linear infinite`):**
    - `Area 8 • Holy Spirit Junction`
    - `Area 9 • Veterans Village`
    - `Central • MRF Central Commonwealth`
    - `Quezon City • QC EPWMD Partner`
    - `Accredited • DENR-EMB Recovery Line`
    - `Exclusive • Barangay Commonwealth Residents` (`id: 'm2-residents', zoneTag: 'Exclusive', label: 'Barangay Commonwealth Residents'` — replaces `Campus Repair Guilds`)
    - `24/7 Access • Smart Locker Hubs`
  - **Badge Styling:** `display: inline-flex; align-items: center; gap: 8px; background: #faf8f5; border: 2px solid #dce4dc; border-radius: 14px; padding: 10px 18px; font-family: 'Quicksand', sans-serif; font-weight: 700; font-size: 0.9375rem; color: #0f172a; white-space: nowrap;` with a `#4f5f4b` icon or `#abf06b` status dot.
  - **Reduced Motion Fallback:** Under `@media (prefers-reduced-motion: reduce)`, `.eco-marquee-row` removes `mask-image`, stops animation, hides the cloned duplicate items, and wraps Row 1 + Row 2 into a clean centered flex grid.

---

### Section 5: Interactive Device Stream Switcher + Central Phone Frame (`DeviceShowcaseSection.tsx`)
- **Anchor ID:** `id="device-switcher"` (also alias target for `Reuse Hub` anchor or add `id="reuse-hub"` wrapper).
- **Background:** `#faf8f5`, `padding: 80px 0`.
- **Header:** Centered `h2`: `Built for Every Device in Your Drawer` + short plain-spoken lead: `Select a household device to preview how EcoByte grades condition, checks battery safety, and routes it locally.`
- **Desktop Layout (`>= 1024px`):** 2-column balanced workspace (`grid-template-columns: 1fr 340px; gap: 48px; align-items: center; max-width: 1040px; margin: 0 auto;`) or 3-column Wika-inspired flanking switcher (`3 cards left | Central PhoneFrame | 2 cards + quick action right`). Using a clean **Left Interactive Selector Stack (5 tactile cards) + Right Central PhoneFrame** (or flanking 3+2 on `lg`) ensures zero awkward orphan spacing and crisp alignment. Let's specify the **Left Tactile 5-Device Selector Grid/Stack + Right Live PhoneFrame** (with the phone centered on mobile above or below the horizontal card tabs).
- **5 Selectable Device Entries (defined in `landingData.ts`):**

| ID | Device Name | Image Import | Condition Grade | Battery Health | EcoPoints | Routing Verdict | Badge Variant | CTA Label & Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `thinkpad-t480` | `Lenovo ThinkPad T480` | `thinkpadImg` + `thinkpadDetailImg` | `Grade B+` | `85% Healthy` | `+180 EcoPoints` | `Community Reuse` | `available` | `View in Reuse Hub` -> `getAuthHref('/reuse')` |
| `galaxy-s10` | `Samsung Galaxy S10` | `galaxyImg` | `Grade B` | `79% Normal` | `+140 EcoPoints` | `Community Reuse` | `available` | `View in Reuse Hub` -> `getAuthHref('/reuse')` |
| `ipad-air` | `iPad Air 64GB` | `ipadImg` | `Grade A-` | `91% Healthy` | `+150 EcoPoints` | `Community Reuse` | `available` | `Claim in Reuse Hub` -> `getAuthHref('/reuse')` |
| `keychron-k2` | `Keychron K2 V2` | `keychronImg` | `Grade A` | `94% Healthy` | `+95 EcoPoints` | `Repair Guide / Reuse` | `green-pill` | `Open Repair Guide` -> `getAuthHref('/reuse-guide')` |
| `gan-charger-65w` | `65W GaN USB-C Charger` | `chargerImg` | `Safe & Tested` | `No Internal Cell` | `+45 EcoPoints` | `Safe Recovery` | `electric` | `Scan Similar Accessory` -> `getAuthHref('/scan')` |

- **Interactive State Logic:**
  - State `selectedDeviceId` defaults to `'thinkpad-t480'`.
  - Each device selector renders as a `<button type="button">` with `aria-pressed={isSelected}`.
  - On click, `setSelectedDeviceId(device.id)`.
  - Inside `PhoneFrame`, wrap the inner screen content in `<div key={selectedDevice.id} className="eco-screen-slide-up">`. Re-keying triggers `.eco-screen-slide-up` (`animation: eco-screen-slide 0.55s cubic-bezier(0.22, 0.9, 0.26, 1) both`) cleanly every time a visitor switches devices.
- **Phone Screen Contents:**
  - Top status row: `Inspection Result` + `StatusBadge` showing the routing verdict (`Community Reuse` / `Repair Guide` / `Safe Recovery`).
  - Hero photo card (`height: 150px`, `border-radius: 14px`, `object-fit: cover` using the real imported JPEG).
  - Title + Condition Grade (`Grade B+`).
  - 2-column telemetry tiles:
    - Left tile: `Battery Health` (`85% Healthy`, `JetBrains Mono` readout + progress bar).
    - Right tile: `Reward Estimate` (`+180 EcoPoints`, `#eef3ed` pill).
  - Recommended Drop-Off Hub strip (`Area 1 Eco-Hub • 0.8 km`).
  - In-phone action button `<RouterLink to={getAuthHref(selectedDevice.ctaRoute)}>` (`Claim in Reuse Hub`, `View in Reuse Hub`, `Open Repair Guide`, or `Scan Similar Accessory`).

---

### Section 6: 3 Alternating Feature Showcases with Phone Mockups (`FeatureShowcases.tsx`)
- **Background:** `#ffffff`, `padding: 88px 0`, `border-top: 2px solid #dce4dc`.
- **Section Headline:** Centered `h2`: `Circular Lifecycle as an Experience`
- **Layout:** Vertical stack of 3 alternating 2-column blocks (`gap: 72px` between blocks, `grid-template-columns: 340px 1fr` or `1fr 340px` on `>= 960px`, `gap: 56px`, `align-items: center`). On mobile (`< 960px`), stack text above phone mockup consistently for reading order.

#### Showcase A (`id="ai-triage"`): Phone Left | Copy Right — **6-Angle AI Device Diagnostic**
- **Copy Column:**
  - `h3`: `6-Angle AI Device Diagnostic`
  - Paragraph: `Snap Front, Back, Left, Right, Top, and Bottom views using guided camera framing. EcoByte checks casing stress, screen integrity, and lithium battery swelling before you walk to a drop-off bin.`
  - Compact feature checklist (3 crisp items with `#4f5f4b` check icons):
    - `Guided 6-slot capture (`Front / Back / Left / Right / Top / Bottom`)`
    - `Lithium battery swelling & thermal hazard screening`
    - `Instant route recommendation: Reuse, Repair, or Safe Recovery`
  - Tactile link button: `Try 6-Angle Scanner` -> `getAuthHref('/scan')` (`.eco-btn .eco-btn-moss`).
- **Phone Mockup Screen:**
  - Session header: `#SCAN-9042` (`JetBrains Mono`) + `98.4% Confidence` badge.
  - Dark viewport (`#0f172a`, `height: 140px`, `border-radius: 14px`) displaying `diagnostic_view.jpeg` (`opacity: 0.55`) with `camera_viewfinder.svg` reticle overlay and `#abf06b` badge `6/6 ANGLES`.
  - 4-photo mini grid (`angle_front.jpeg`, `angle_back.jpeg`, `angle_left.jpeg`, `angle_right.jpeg`) + `Top` & `Bottom` checked chips (`Front ✓`, `Back ✓`, `Left ✓`, `Right ✓`, `Top ✓`, `Bottom ✓`).
  - Amber Diagnostic Warning card (`#fef3c7` bg, `1.5px solid #fde68a`, `#d97706` icon): `Lithium Battery Check: 68% capacity — isolate before transport`.

#### Showcase B (`id="how-it-works"`): Copy Left | Phone Right — **Verified Recovery Loop**
- **Copy Column:**
  - `h3`: `Verified Recovery Loop`
  - Paragraph: `Every device follows one accountable path from your desk to a verified Barangay Commonwealth facility.`
  - **The ONLY numbered steps on the page (`01`, `02`, `03`):**
    - `01` — **6-Angle Scan & AI Triage** — Capture six angles and receive a condition grade plus battery safety clearance.
    - `02` — **Smart Locker or MRF Schedule** — Reserve a 24/7 Smart Bin slot or book a staffed drop-off desk with pass `#ECO-4821`.
    - `03` — **Physical Turn-Over & EcoPoints** — Desk officer confirms physical receipt and credits verified EcoPoints to your resident ledger.
- **Phone Mockup Screen:**
  - Active request card (`Req #2041 • ThinkPad T480`)
  - Real `<StepperTracker steps={LANDING_TRACKER_STEPS} currentStep={3} />` imported directly from `@/components/ui/StepperTracker` (`Submitted`, `Review`, `Scheduled`, `Collected`, `Turned over`).
  - Digital Locker Pass card (`#ECO-4821` in `JetBrains Mono`, `Area 1 Eco-Hub Desk 2`, `Reserved • Active`).

#### Showcase C (`id="commonwealth-map"`): Phone Left | Copy Right — **Commonwealth 9-Area Drop-Off Finder**
- **Copy Column:**
  - `h3`: `Commonwealth 9-Area Drop-Off Finder`
  - Paragraph: `Filter staffed Material Recovery Facilities and 24/7 Smart Bins across all nine Barangay Commonwealth clusters, sorted by distance and hazardous-battery accreditation.`
  - Tactile link button: `Open Live Drop-Off Map` -> `getAuthHref('/drop-offs')` (`.eco-btn .eco-btn-white`).
- **Phone Mockup Screen:**
  - Map banner using `dropoff_map.svg` (`height: 120px`, `object-fit: cover`, `border-radius: 12px`, `border: 1.5px solid #dce4dc`).
  - 3 real site cards sourced from `COMMONWEALTH_FALLBACK_SITES`:
    1. `Area 1 Eco-Hub (Brgy Hall Complex)` — `0.8 km` • `8:00 AM - 5:00 PM` • `Staffed & Smart Bin`
    2. `Area 2 Lupang Pangako E-Collection Base` — `1.1 km` • `24/7 Smart Bin Access` • `24/7 Smart Bin`
    3. `Area 5 Commonwealth Market / MRT-7 Base` — `1.8 km` • `6:00 AM - 8:00 PM` • `Staffed & Smart Bin`

---

### Section 7: Interactive In-Phone Walkthrough ("Everything Happens in One Neighborhood Loop")
- **Background:** `#eef3ed` (Moss Tint Surface), `padding: 80px 0`, `border-top: 2px solid #dce4dc`, `border-bottom: 2px solid #dce4dc`.
- **Header:** Centered `h2`: `Everything Happens in One Neighborhood Loop` + subtitle: `Switch views to inspect the diagnostic report, digital pickup pass, and nearest Commonwealth drop-off station.`
- **Interactive Mode Tabs (3 tactile pill buttons, `role="tablist"`):**
  1. `Diagnostic Report` (`id: 'diagnostic'`)
  2. `Reuse Pass #ECO-4821` (`id: 'pass'`)
  3. `Barangay Drop-Off` (`id: 'dropoff'`)
- **Tab Behavior:** Clicking a tab updates `activeWalkthroughTab` and triggers `.eco-screen-slide-up` inside a centered `PhoneFrame` (`max-width: 340px`), paired with a companion context card (`activeMode.title`, `activeMode.summary`, `activeMode.highlights`, and CTA `<RouterLink to={getAuthHref(activeMode.ctaRoute)}>`):
  - **`Diagnostic Report` Screen:** `diagnostic_view.jpeg`, `#SCAN-9042`, `6/6 Angles Verified`, battery telemetry (`68%` amber notice), button `<RouterLink to={getAuthHref('/diagnostic')}>Route to Safe Recovery</RouterLink>`, companion CTA `Open AI Diagnostic View` -> `getAuthHref('/diagnostic')`.
  - **`Reuse Pass #ECO-4821` Screen:** `keychron.jpeg` + `Keychron K2 V2`, large `JetBrains Mono` pass code box `ECO-4821` (`#eef3ed` bg, `2px dashed #4f5f4b`), `Barangay Commonwealth MRF • Desk 2`, QR graphic, `Reserved` badge, button `<RouterLink to={getAuthHref('/reservation-code')}>Open Reservation Pass</RouterLink>`. Companion card copy: `"Verified Barangay Commonwealth residents reserve tested hardware from the Community Reuse Hub and present a digital pass at Desk 2 for accountable handoff."` (NO student/campus references), companion CTA `View Sample Reservation Pass` -> `getAuthHref('/reservation-code')`.
  - **`Barangay Drop-Off` Screen:** `dropoff_map.svg` preview, filter chips (`All Sites (9)`, `24/7 Smart Bin`), `Area 1 Eco-Hub • Open Now`, and `Area 4 Litex Smart Bin • 24/7`, button `<RouterLink to={getAuthHref('/drop-offs')}>Browse All 9 Areas</RouterLink>`, companion CTA `Launch Drop-Off Finder` -> `getAuthHref('/drop-offs')`.

---

### Section 8: 2-Column Barangay Commonwealth Program Section ("Built Exclusively for Barangay Commonwealth") (`PilotAndFooterSection.tsx`)
- **Anchor ID:** `id="pilot"`
- **Background:** `#faf8f5`, `padding: 80px 0`.
- **Header:** Centered `h2`: `Built Exclusively for Barangay Commonwealth` + centered subcopy: `Operating exclusively for households across Areas 1 to 9 and Barangay Commonwealth Material Recovery Facility operations.`
- **2-Column Grid (`grid-template-columns: repeat(2, minmax(0, 1fr))` on `>= 768px`, 1 column on mobile, `gap: 24px`):**
  1. **Card 1 — Barangay Commonwealth MRF Operations**
     - Surface: `#eef3ed`, `border: 2px solid #c4d9c0`, `border-bottom: 4px solid #78957a`, `border-radius: 22px`, `padding: 32px`.
     - Badge: `StatusBadge label="LGU & MRF Operations" variant="green-pill" size="md"`
     - Title (`h3`): `Barangay Commonwealth MRF Operations`
     - Copy: `Equip MRF Central and barangay desk officers with intake inspection queues, lithium hazard segregation logs, and live Smart Locker occupancy tracking across Areas 1 to 9.`
     - Bullet highlights:
       - `Physical Inspection Queue for MRF desk officers`
       - `DENR-EMB aligned hazardous battery disposal manifests`
       - `Area 1 to 9 Smart Locker occupancy telemetry`
     - CTA: `Open Operator Portal` -> `getAuthHref('/admin')` (`.eco-btn .eco-btn-moss`; directs unauthenticated visitors to `/signin?redirect=%2Fadmin`, or `/admin` if already authenticated).
  2. **Card 2 — Commonwealth Resident Program (Areas 1–9)**
     - Surface: `#ffffff`, `border: 2px solid #dce4dc`, `border-bottom: 4px solid #c1cdc1`, `border-radius: 22px`, `padding: 32px`.
     - Badge: `StatusBadge label="Verified Barangay Residents" variant="available" size="md"`
     - Title (`h3`): `Commonwealth Resident Program (Areas 1–9)`
     - Copy: `Exclusive household access across Katuparan, Lupang Pangako, Payatas Border, Litex, Commonwealth Market, Pilot Area, Kasunduan, Holy Spirit, and Veterans Village.`
     - Bullet highlights:
       - `6-angle device triage before drop-off or locker booking`
       - `Verified Reuse Hub claims with Reservation Pass #ECO-4821`
       - `Household EcoPoints ledger credited at MRF turn-over`
     - CTA: `Sign In as Resident` -> `/signin` (or `getAuthHref('/dashboard')` if signed in; `.eco-btn .eco-btn-lime`).

---

### Section 9: Full-Width Bottom CTA Banner + 4-Column Tactile Footer (`PilotAndFooterSection.tsx`)
#### Part A: Bottom CTA Banner
- **Background:** Deep Forest Moss (`linear-gradient(180deg, #4f5f4b 0%, #2d3e2c 100%)`), `padding: 72px 0 0`, `overflow: hidden`.
- **Layout:** Centered `max-width: 1120px`, 2-column grid (`1.2fr 0.8fr` on `>= 960px`, `align-items: end`, `gap: 40px`).
- **Left Copy (`padding-bottom: 72px`):**
  - `h2` (`#ffffff`): `Empty the Tech Drawer Today.`
  - Subcopy (`#dce4dc`): `Turn unused laptops, phones, and cables into verified community hardware or safe material recovery in Barangay Commonwealth.`
  - Button row:
    - `Start 6-Angle Scan` -> `getAuthHref('/scan')` (`.eco-btn .eco-btn-lime`)
    - `View Drop-Off Map` -> `getAuthHref('/drop-offs')` (`.eco-btn .eco-btn-outline-light` — transparent/moss bg, `2px solid #abf06b`, `#ffffff` text)
- **Right Rising PhoneFrame (`PhoneFrame.tsx`):**
  - Anchored to bottom edge of the banner (`border-bottom-left-radius: 0; border-bottom-right-radius: 0;`), showing `thinkpad_detail.jpeg` (`Lenovo ThinkPad T480`) + `+180 EcoPoints Verified` + `Turned over at Area 1 Eco-Hub`.

#### Part B: 4-Column Tactile Footer
- **Background:** `#ffffff`, `border-top: 2px solid #dce4dc`, `padding: 56px 0 40px`.
- **Grid:** `grid-template-columns: 1.3fr repeat(3, 1fr)` on `>= 900px`, `repeat(2, 1fr)` on tablet, `1fr` on mobile, `gap: 36px`.
- **Columns (public auth routes remain direct; all protected routes wrap in `getAuthHref(link.to)`):**
  1. **Brand Column:** `ecobyte_logo.svg` + `EcoByte` (`'Rethink Sans'`, `800`), concise note: `Circular electronics diagnostics, reuse, and safe recovery in Barangay Commonwealth, Quezon City.`
  2. **Resident Tools:**
     - `6-Angle Device Scanner` -> `getAuthHref('/scan')`
     - `AI Diagnostic Results` -> `getAuthHref('/diagnostic')`
     - `Community Reuse Hub` -> `getAuthHref('/reuse')`
     - `9-Area Drop-Off Finder` -> `getAuthHref('/drop-offs')`
  3. **Account & Passes:**
     - `Resident Dashboard` -> `getAuthHref('/dashboard')`
     - `Sign In` -> `/signin` (public)
     - `Create Account` -> `/register` (public)
     - `Reservation Pass` -> `getAuthHref('/reservation-code')`
  4. **MRF Operations:**
     - `Admin Overview` -> `getAuthHref('/admin')`
     - `Inspection Queue` -> `getAuthHref('/admin/to-inspect')`
     - `Reuse Inventory` -> `getAuthHref('/admin/reuse-hub')`
     - `Hazardous Disposal` -> `getAuthHref('/admin/disposal')`
- **Bottom Legal Strip:** `border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 24px;` — `EcoByte Circular Electronics Lifecycle, Barangay Commonwealth, Quezon City` + `MRF & DENR-EMB Aligned Workflow`.

---

## 5. CSS Keyframes, PhoneFrame Geometry & Accessibility Spec (`landing.css`)

### 5.1 PhoneFrame Component (`PhoneFrame.tsx`)
Reusable realistic device frame matching Wika's crisp proportions without SVG bloat:
- Outer chassis: `width: 100%; max-width: 332px; background: #0f172a; border-radius: 42px; padding: 11px; border: 3px solid #1e293b; box-shadow: 0 22px 48px rgba(15, 23, 42, 0.18);`
- When `dockedBottom` prop is `true` (Hero & Bottom CTA Banner): `border-bottom-left-radius: 0; border-bottom-right-radius: 0; padding-bottom: 0; border-bottom: 0;`
- Inner bezel screen: `background: #faf8f5; border-radius: 32px; overflow: hidden; min-height: 490px; display: flex; flex-direction: column;` (or `min-height: 410px` when `dockedBottom`).
- Top Dynamic Island / Speaker Pill: centered `width: 92px; height: 22px; background: #0f172a; border-radius: 9999px; margin: 10px auto 8px;`.

### 5.2 Keyframes (`landing.css`)
```css
@keyframes eco-slide-up-phone {
  from {
    opacity: 0;
    transform: translateY(84px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes eco-screen-slide {
  from {
    opacity: 0.4;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes eco-cloud-sky {
  from { transform: translateX(-50%); }
  to { transform: translateX(0%); }
}

@keyframes eco-cloud-mid {
  from { transform: translateX(0%); }
  to { transform: translateX(-50%); }
}

@keyframes eco-cloud-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes eco-marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes eco-marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
```

### 5.3 Reduced Motion & Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  .eco-cloud-sky,
  .eco-cloud-mid,
  .eco-cloud-float,
  .eco-slide-up-phone,
  .eco-screen-slide-up,
  .eco-marquee-left,
  .eco-marquee-right {
    animation: none !important;
    transform: none !important;
  }

  .eco-marquee-row {
    -webkit-mask-image: none;
    mask-image: none;
  }

  .eco-marquee-track {
    flex-wrap: wrap;
    justify-content: center;
    width: auto;
    gap: 12px;
    padding: 0 16px;
  }

  .eco-marquee-clone {
    display: none;
  }
}
```
- **Keyboard Focus:** Every `<button>`, `<a href>`, and `<RouterLink>` uses `:focus-visible { outline: 3px solid #4f5f4b; outline-offset: 2px; }` (or `#abf06b` on dark/moss surfaces).
- **Color Contrast:** `#0f172a` on `#faf8f5`/`#ffffff`/`#abf06b` exceeds `12:1`. `#475569` on `#faf8f5` exceeds `6.5:1`. `#ffffff` on `#4f5f4b` exceeds `6.8:1` (`WCAG AA` compliant).
- **Semantic Landmarks:** Single `<nav aria-label="Main">`, `<header id="top">`, `<main>` wrapping sections, `<footer aria-label="Footer">`, and `aria-hidden="true"` on decorative SVGs and cloned marquee nodes.

---

## 6. File Architecture, Auth Gating & Execution Plan for Argon

### 6.1 Auth-Gating Helper (`src/components/landing/landingData.ts`)
Authentication in EcoByte is stored in `localStorage` under `'ecobyte_token'` (set by `SignInPage.tsx` and cleared by `authApi.logout()` in `src/lib/api/auth.ts`). Export a pure helper from `landingData.ts` (avoiding `react/only-export-components` warnings in `.tsx` files):

```ts
export function hasActiveSession(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.localStorage.getItem('ecobyte_token'))
}

export function getAuthHref(targetRoute: string): string {
  if (hasActiveSession()) {
    return targetRoute
  }
  return `/signin?redirect=${encodeURIComponent(targetRoute)}`
}
```

**Required CTA & Link Gating Across All Landing Components:**
Every login-required destination must pass through `getAuthHref(targetRoute)` so unauthenticated visitors click straight into `/signin?redirect=...` (while signed-in users jump straight to the feature):
- **`LandingNavbar.tsx`**:
  - Desktop `Scan a Device` (`to={getAuthHref('/scan')}`)
  - Mobile drawer `Scan a Device` (`to={getAuthHref('/scan')}`)
  - (`Sign In` remains `to="/signin"` directly)
- **`LandingPage.tsx`**:
  - Hero primary CTA `Start 6-Angle Scan` (`to={getAuthHref('/scan')}`)
  - Hero secondary CTA `Browse Reuse Hub` (`to={getAuthHref('/reuse')}`)
  - Hero PhoneFrame `iPad Air 64GB` copy: update `"100% Functional, ready for student claim"` -> `"100% Functional, ready for resident claim"`
- **`DeviceShowcaseSection.tsx`**:
  - Marquee subtitle: `"Nine neighborhood eco-depots, 24/7 Smart Lockers, and MRF Central connected in one Barangay Commonwealth loop."`
  - PhoneFrame CTA (`View in Reuse Hub`, `Claim in Reuse Hub`, `Open Repair Guide`, `Scan Similar Accessory`): `to={getAuthHref(selectedDevice.ctaRoute)}`
- **`FeatureShowcases.tsx`**:
  - Showcase A `Try 6-Angle Scanner`: `to={getAuthHref('/scan')}`
  - Showcase C `Open Live Drop-Off Map`: `to={getAuthHref('/drop-offs')}`
  - Walkthrough Tab 1 `Route to Safe Recovery`: `to={getAuthHref('/diagnostic')}`
  - Walkthrough Tab 2 `Open Reservation Pass`: `to={getAuthHref('/reservation-code')}`
  - Walkthrough Tab 3 `Browse All 9 Areas`: `to={getAuthHref('/drop-offs')}`
  - Walkthrough Companion CTA (`Open AI Diagnostic View`, `View Sample Reservation Pass`, `Launch Drop-Off Finder`): `to={getAuthHref(activeMode.ctaRoute)}`
- **`PilotAndFooterSection.tsx`**:
  - Card 1 `Open Operator Portal`: `to={getAuthHref('/admin')}`
  - Card 2 `Sign In as Resident`: `to={hasActiveSession() ? '/dashboard' : '/signin'}` (or `/signin` when logged out, `/dashboard` when signed in)
  - Bottom CTA `Start 6-Angle Scan`: `to={getAuthHref('/scan')}`
  - Bottom CTA `View Drop-Off Map`: `to={getAuthHref('/drop-offs')}`
  - Footer links: wrap protected routes (`/scan`, `/diagnostic`, `/reuse`, `/drop-offs`, `/dashboard`, `/reservation-code`, `/admin`, `/admin/to-inspect`, `/admin/reuse-hub`, `/admin/disposal`) in `getAuthHref(link.to)`; keep `/signin` and `/register` direct.

### 6.2 Files & Exact Updates
1. **`src/components/landing/landing.css`** — CSS tokens, tactile 3D `.eco-btn` / `.eco-card` classes, `.eco-marquee-row`, `.eco-phone-*` rules, keyframes, responsive layout helpers, and `prefers-reduced-motion` block.
2. **`src/components/landing/landingData.ts`** — Strongly-typed arrays & interfaces (no JSX):
   - `NAV_LINKS` (5 anchor links; optionally label `#pilot` as `Commonwealth` or `Barangay Program`)
   - `DEVICE_CATEGORY_PILLS` (6 category pills mapped to device IDs or `#ai-triage`)
   - `MARQUEE_ROW_ONE` & `MARQUEE_ROW_TWO`: replace `{ id: 'm2-campus', zoneTag: 'Education', label: 'Campus Repair Guilds' }` with `{ id: 'm2-residents', zoneTag: 'Exclusive', label: 'Barangay Commonwealth Residents' }`
   - `SHOWCASE_DEVICES`: update `ipad-air` `ctaLabel` from `'Claim for Study'` to `'Claim in Reuse Hub'`
   - `WALKTHROUGH_MODES`: update `pass` `summary` from `"Students and residents reserve tested hardware..."` to `"Verified Barangay Commonwealth residents reserve tested hardware..."`
   - `hasActiveSession()` and `getAuthHref()`
   - `FOOTER_COLUMNS` (3 link columns matching `src/App.tsx` routes)
3. **`src/components/landing/LandingNavbar.tsx`** — Sticky tactile navbar + accessible mobile drawer (`inert` when closed), gated `Scan a Device` CTAs via `getAuthHref('/scan')`.
4. **`src/components/landing/HeroScenicIllustration.tsx`** — Multi-layered inline SVG clouds + Quezon City / Commonwealth foliage & civic skyline.
5. **`src/components/landing/PhoneFrame.tsx`** — Reusable iPhone-style crisp slate bezel with `dockedBottom` variant and `.eco-slide-up-phone` / `.eco-screen-slide-up` support.
6. **`src/components/landing/DeviceShowcaseSection.tsx`** — Section 3 (Category Bar) + Section 4 (Commonwealth-exclusive Marquee) + Section 5 (5-device selector + live sliding `PhoneFrame` with `getAuthHref`).
7. **`src/components/landing/FeatureShowcases.tsx`** — Section 6 (3 alternating phone-mockup showcases) + Section 7 (3-tab Interactive In-Phone Walkthrough with `getAuthHref`).
8. **`src/components/landing/PilotAndFooterSection.tsx`** — Section 8 (`Built Exclusively for Barangay Commonwealth`: MRF Operations card + Commonwealth Resident Program (Areas 1–9) card, zero campus/student copy) + Section 9 (Full-width Forest Moss CTA Banner with docked `PhoneFrame` + 4-column Footer with gated protected links).
9. **`src/pages/LandingPage.tsx`** — Composes all sections inside `<Box className="eco-landing-root">`, gates Hero CTAs via `getAuthHref`, updates Hero Phone `iPad Air 64GB` copy to `"100% Functional, ready for resident claim"`.
10. **`src/App.tsx`** — Route mounting + `RequireAuth` guard:
    - Keep public routes outside `RequireAuth`: `/`, `/signin`, `/login`, `/register`, and wildcard `<Route path="*" element={<Navigate to="/" replace />} />`.
    - Add a clean `RequireAuth` component in `src/App.tsx` (using `useLocation`, `Navigate`, `import type { FC, ReactNode } from 'react'`):
      ```tsx
      const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
        const location = useLocation()
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('ecobyte_token') : null
        if (!token) {
          const target = `${location.pathname}${location.search}`
          return <Navigate to={`/signin?redirect=${encodeURIComponent(target)}`} replace />
        }
        return <>{children}</>
      }
      ```
    - Wrap **every** protected resident and admin route element in `<RequireAuth>...</RequireAuth>`:
      - Resident routes inside `<AppShell>`: `/dashboard`, `/scan`, `/assess`, `/diagnostic`, `/reuse-guide`, `/reuse`, `/reuse/:id`, `/confirm-reservation`, `/reservation-code`, `/proof-of-claim`, `/drop-offs`, `/dropoff-schedule`, `/requests`
      - Admin routes inside `<AdminShell>`: `/admin`, `/admin/dashboard`, `/admin/to-inspect`, `/admin/inspect`, `/admin/inspect/:id`, `/admin/reuse-hub`, `/admin/disposal`, `/admin/access`
    - Redirect aliases (`/home` -> `/dashboard`, `/dropoffs` -> `/drop-offs`, `/schedule` -> `/dropoff-schedule`, etc.) resolve into the protected target routes and are therefore guarded automatically.
11. **`src/pages/SignInPage.tsx`** — Support `Back to Home` + safe `?redirect=` post-login routing:
    - Read `useSearchParams()` from `react-router-dom`.
    - Validate redirect target cleanly to prevent open redirects:
      ```ts
      const rawRedirect = searchParams.get('redirect')
      const safeRedirect =
        rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
          ? rawRedirect
          : null
      ```
    - After successful login (both live API and offline fallback paths at lines 70–73 and 92–95):
      - If `safeRedirect` exists and (`isAdmin || !safeRedirect.startsWith('/admin')`), `navigate(safeRedirect, { replace: true })`.
      - Otherwise fall back to `navigate(isAdmin ? '/admin' : '/dashboard')`.
    - Retain the existing `Back to Home` link pointing to `/` above the brand header.

---

## 7. Verification Checklist (Must Pass After Implementation)

1. **Static Lint Check (`oxlint`):**
   ```bash
   cd /home/seanizonfire/Desktop/Capstone/Ecobyte/frontend && npm run lint
   ```
   Confirm `0` errors and `0` `react/only-export-components` warnings across all landing and routing files.
2. **TypeScript + Production Vite Build:**
   ```bash
   cd /home/seanizonfire/Desktop/Capstone/Ecobyte/frontend && npm run build
   ```
   Confirm `tsc -b && vite build` succeeds cleanly with zero `verbatimModuleSyntax`, `erasableSyntaxOnly`, or `noUnusedLocals` errors and all imported `@/assets/ui/*` images bundle properly.
3. **Barangay Commonwealth Exclusivity Check:**
   ```bash
   grep -rn -iE "campus|student|study|academic|guild" src/pages/LandingPage.tsx src/components/landing/
   ```
   Confirm zero matches remain anywhere in the landing page components or data.
4. **Auth Gating & Route Protection Verification (`http://localhost:5173/`):**
   - Clear `localStorage` (`localStorage.removeItem('ecobyte_token')`) and open `/`:
     - Verify `/` renders `LandingPage` cleanly and `/signin` has a working `Back to Home` link to `/`.
     - Verify every login-required CTA on the landing page (`Scan a Device`, `Start 6-Angle Scan`, `Browse Reuse Hub`, `Open Operator Portal`, `View Drop-Off Map`, Device Switcher CTA, Walkthrough CTAs, and protected footer links) navigates to `/signin?redirect=...`.
     - Verify navigating directly to `/scan`, `/reuse`, `/dashboard`, `/drop-offs`, or `/admin` in the URL bar while logged out immediately redirects to `/signin?redirect=...`.
     - Sign in (resident or admin) and verify the app lands on the safe `?redirect=` target (or `/dashboard` / `/admin` when no redirect param is present), and that visiting `/` while logged in lets gated CTAs navigate directly to `/scan`, `/reuse`, `/drop-offs`, etc.
5. **Visual, Responsive & Reduced-Motion Checks:**
   - Verify zero broken `<img>` elements (`naturalWidth > 0` for every device photo, `ecobyte_logo.svg`, `diagnostic_view.jpeg`, `angle_*.jpeg`, `dropoff_map.svg`).
   - Test clicking all 6 Category Pills, all 5 Device Switcher cards, and all 3 Interactive Walkthrough tabs.
   - Test mobile (`375px`), tablet (`768px`), and desktop (`1440px`) viewports for zero horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`) and working mobile hamburger drawer.
   - Test `prefers-reduced-motion: reduce` emulation to verify cloud, phone, and marquee animations stop and marquee wraps cleanly.
