import type { BadgeVariant } from '@/components/ui/StatusBadge'
import type { StepItem } from '@/components/ui/StepperTracker'
import { COMMONWEALTH_FALLBACK_SITES } from '@/components/map/commonwealthData'
import ecobyteLogo from '@/assets/ui/ecobyte_logo.svg'

export const LANDING_ASSETS = {
  ecobyteLogo,
} as const

export type AcceptedCategoryId =
  | 'laptops'
  | 'smartphones'
  | 'tablets'
  | 'peripherals'
  | 'chargers'
  | 'batteries'

export type CategoryPillIconKey =
  | 'laptop'
  | 'smartphone'
  | 'tablet'
  | 'keyboard'
  | 'charger'
  | 'battery'

export interface NavLinkItem {
  label: string
  href: string
}

export interface CategoryPillItem {
  id: string
  label: string
  icon: CategoryPillIconKey
  targetSectionId: string
  categoryId: AcceptedCategoryId
}

export interface MarqueeLocationBadge {
  id: string
  zoneTag: string
  label: string
}

export interface AcceptedCategoryItem {
  id: AcceptedCategoryId
  name: string
  icon: CategoryPillIconKey
  examples: string
  frontScanFocus: string
  backScanFocus: string
  safetyNote: string
  isHazardPriority?: boolean
  routingOptions: string
  badgeVariant: BadgeVariant
  matchKeywords: string[]
  ctaLabel: string
  ctaRoute: string
}

export interface RecoveryLoopStep {
  stepNumber: '01' | '02' | '03'
  title: string
  description: string
}

export interface LandingSiteSummary {
  id: string
  name: string
  address: string
  hours: string
  accessType: string
  isOpen: boolean
}

export type WalkthroughModeId = 'diagnostic' | 'pass' | 'dropoff'

export interface WalkthroughModeItem {
  id: WalkthroughModeId
  tabLabel: string
  title: string
  summary: string
  highlights: string[]
  ctaLabel: string
  ctaRoute: string
}

export interface FooterColumn {
  heading: string
  links: { label: string; to: string }[]
}

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

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Accepted Devices', href: '#device-switcher' },
  { label: 'AI Triage', href: '#ai-triage' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Commonwealth Map', href: '#commonwealth-map' },
  { label: 'Program', href: '#pilot' },
]

export const DEVICE_CATEGORY_PILLS: CategoryPillItem[] = [
  {
    id: 'cat-laptops',
    label: 'Laptops & PCs',
    icon: 'laptop',
    targetSectionId: 'device-switcher',
    categoryId: 'laptops',
  },
  {
    id: 'cat-smartphones',
    label: 'Smartphones',
    icon: 'smartphone',
    targetSectionId: 'device-switcher',
    categoryId: 'smartphones',
  },
  {
    id: 'cat-tablets',
    label: 'Tablets',
    icon: 'tablet',
    targetSectionId: 'device-switcher',
    categoryId: 'tablets',
  },
  {
    id: 'cat-keyboards',
    label: 'Keyboards & Peripherals',
    icon: 'keyboard',
    targetSectionId: 'device-switcher',
    categoryId: 'peripherals',
  },
  {
    id: 'cat-chargers',
    label: 'Chargers & Cables',
    icon: 'charger',
    targetSectionId: 'device-switcher',
    categoryId: 'chargers',
  },
  {
    id: 'cat-batteries',
    label: 'Batteries & E-Waste',
    icon: 'battery',
    targetSectionId: 'device-switcher',
    categoryId: 'batteries',
  },
]

export const MARQUEE_ROW_ONE: MarqueeLocationBadge[] = [
  { id: 'm1-base1', zoneTag: 'Base 1', label: 'Brgy. Hall Complex' },
  { id: 'm1-base2', zoneTag: 'Base 2', label: 'Martan St.' },
  { id: 'm1-base3', zoneTag: 'Base 3', label: 'Don Fabian' },
  { id: 'm1-base4', zoneTag: 'Base 4', label: 'Katuparan' },
  { id: 'm1-base5', zoneTag: 'Base 5', label: 'Riverside' },
  { id: 'm1-base6', zoneTag: 'Base 6', label: 'Kristong Hari' },
  { id: 'm1-base7', zoneTag: 'Base 7', label: 'Upper Kamias' },
]

export const MARQUEE_ROW_TWO: MarqueeLocationBadge[] = [
  { id: 'm2-base8', zoneTag: 'Base 8', label: 'Pilot Area' },
  { id: 'm2-base9', zoneTag: 'Base 9', label: 'Lupang Pangako' },
  { id: 'm2-mrf', zoneTag: 'Central', label: 'MRF Central Commonwealth' },
  { id: 'm2-denr', zoneTag: 'Workflow', label: 'DENR-EMB Aligned Recovery' },
  { id: 'm2-residents', zoneTag: 'Exclusive', label: 'Barangay Commonwealth Residents' },
  { id: 'm2-bins', zoneTag: 'Drop-Off', label: 'Staffed Eco-Hubs & Smart Bins' },
]

export const ACCEPTED_CATEGORIES: AcceptedCategoryItem[] = [
  {
    id: 'laptops',
    name: 'Laptops & PCs',
    icon: 'laptop',
    examples: 'Notebooks, netbooks, monitors, and desktop units',
    frontScanFocus: 'Display panel, hinges, keyboard deck, and trackpad condition',
    backScanFocus: 'Bottom chassis integrity, vents, battery compartment, and model label',
    safetyNote: 'Checked for battery swelling or warped casings before MRF intake.',
    routingOptions: 'Reuse · Repair · Recovery',
    badgeVariant: 'available',
    matchKeywords: ['laptop', 'computer', 'pc', 'desktop', 'monitor'],
    ctaLabel: 'Start 2-Angle Scan',
    ctaRoute: '/scan',
  },
  {
    id: 'smartphones',
    name: 'Smartphones',
    icon: 'smartphone',
    examples: 'Working, cracked, or non-booting Android and iOS handsets',
    frontScanFocus: 'Touchscreen glass cracks, display integrity, and front bezel seams',
    backScanFocus: 'Rear housing, camera module, and signs of battery bulging',
    safetyNote: 'Sign out of accounts and remove SIM/SD cards before drop-off.',
    routingOptions: 'Reuse · Repair · Safe Drop-Off',
    badgeVariant: 'available',
    matchKeywords: ['phone', 'mobile', 'smartphone'],
    ctaLabel: 'Start 2-Angle Scan',
    ctaRoute: '/scan',
  },
  {
    id: 'tablets',
    name: 'Tablets',
    icon: 'tablet',
    examples: 'Wi-Fi tablets, cellular tablets, and e-readers',
    frontScanFocus: 'Screen surface, glass cracks, and frame separation',
    backScanFocus: 'Back shell flatness, serial/model print, and charging port edge',
    safetyNote: 'Large flat lithium packs are screened for bulging or bent frames.',
    routingOptions: 'Reuse · Repair · Recovery',
    badgeVariant: 'available',
    matchKeywords: ['tablet', 'ipad', 'reader'],
    ctaLabel: 'Start 2-Angle Scan',
    ctaRoute: '/scan',
  },
  {
    id: 'peripherals',
    name: 'Keyboards & Peripherals',
    icon: 'keyboard',
    examples: 'Keyboards, mice, webcams, routers, and audio accessories',
    frontScanFocus: 'Keycaps, buttons, indicators, and surface wear',
    backScanFocus: 'Underside label, battery cover, and cable or dongle ports',
    safetyNote: 'Remove disposable AA/AAA cells separately if corroded.',
    routingOptions: 'Reuse · Repair · Recovery',
    badgeVariant: 'green-pill',
    matchKeywords: ['keyboard', 'mouse', 'peripheral', 'audio', 'router', 'speaker'],
    ctaLabel: 'Start 2-Angle Scan',
    ctaRoute: '/scan',
  },
  {
    id: 'chargers',
    name: 'Chargers & Cables',
    icon: 'charger',
    examples: 'Power adapters, USB-C bricks, charging cords, and power strips',
    frontScanFocus: 'Prongs, connector tips, and casing seams',
    backScanFocus: 'Rating plate, cord strain relief, and heat/burn marks',
    safetyNote: 'Scorched or frayed adapters are routed strictly to material recovery.',
    routingOptions: 'Reuse · Material Recovery',
    badgeVariant: 'electric',
    matchKeywords: ['charger', 'cable', 'adapter', 'cord', 'power'],
    ctaLabel: 'Start 2-Angle Scan',
    ctaRoute: '/scan',
  },
  {
    id: 'batteries',
    name: 'Batteries & Hazardous E-Waste',
    icon: 'battery',
    examples: 'Power banks, loose lithium-ion cells, and swollen-battery units',
    frontScanFocus: 'Front casing warping, separation, or fluid residue',
    backScanFocus: 'Rear swelling, vents, and exposed terminals',
    safetyNote:
      'Do not puncture, compress, or charge. Pack in a non-conductive container and bring directly to a staffed Barangay MRF desk.',
    isHazardPriority: true,
    routingOptions: 'Isolated Safe Drop-Off',
    badgeVariant: 'hazard',
    matchKeywords: ['battery', 'power bank', 'lithium', 'hazard'],
    ctaLabel: 'Schedule Safe Drop-Off',
    ctaRoute: '/dropoff-schedule',
  },
]

export const RECOVERY_LOOP_STEPS: RecoveryLoopStep[] = [
  {
    stepNumber: '01',
    title: '2-Angle Scan & AI Triage',
    description:
      'Capture Front and Back views and complete a short intake checklist for battery hazard screening and Stage 1 routing.',
  },
  {
    stepNumber: '02',
    title: 'Drop-Off Hub or Smart Bin Schedule',
    description:
      'Schedule a staffed Eco-Hub slot or drop off at a 24/7 Smart Bin across Barangay Commonwealth Bases 1 to 9.',
  },
  {
    stepNumber: '03',
    title: 'Physical Turn-Over & Verified Intake',
    description:
      'Barangay MRF officers physically inspect your device on site and log verified recovery or Reuse Hub eligibility.',
  },
]

export const LANDING_TRACKER_STEPS: StepItem[] = [
  { id: 1, label: 'Submitted' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Scheduled' },
  { id: 4, label: 'Collected' },
  { id: 5, label: 'Turned over' },
]

export const SCAN_TWO_ANGLES: { id: 'front' | 'back'; label: string; detail: string }[] = [
  {
    id: 'front',
    label: 'Front View',
    detail: 'Screen, display & front bezel',
  },
  {
    id: 'back',
    label: 'Back View',
    detail: 'Rear casing, label & battery panel',
  },
]

/** Official Barangay Commonwealth base directory without synthetic distances. */
export const DEFAULT_COMMONWEALTH_SITES: LandingSiteSummary[] = COMMONWEALTH_FALLBACK_SITES.map(
  (site) => ({
    id: site.id,
    name: site.name,
    address: site.address,
    hours: site.hours,
    accessType: site.type,
    isOpen: site.isOpen,
  }),
)

export const WALKTHROUGH_MODES: WalkthroughModeItem[] = [
  {
    id: 'diagnostic',
    tabLabel: 'Diagnostic Report',
    title: 'Screen Battery Hazards Before Transport',
    summary:
      'Two guided angles (Front and Back) paired with quick intake questions let EcoByte flag casing wear and lithium swelling risk before an item enters a neighborhood station.',
    highlights: [
      'Guided 2-angle capture covering Front and Back views',
      'Flags swollen or leaking lithium cells for isolated MRF handling',
      'Recommends Reuse, Repair, or Safe Drop-Off before you leave home',
    ],
    ctaLabel: 'Start 2-Angle Scan',
    ctaRoute: '/scan',
  },
  {
    id: 'pass',
    tabLabel: 'Reuse Pickup Pass',
    title: 'Claim Working Tech with a Verified Pickup Pass',
    summary:
      'Verified Barangay Commonwealth residents can reserve MRF-tested hardware from the Community Reuse Hub and present a digital pickup pass at the barangay desk for accountable handoff.',
    highlights: [
      'Unique digital pickup pass locked to your resident account',
      '48-hour reservation window at Barangay Commonwealth Eco-Hubs',
      'Photo proof-of-claim closes the circular recovery loop',
    ],
    ctaLabel: 'Browse Reuse Hub',
    ctaRoute: '/reuse',
  },
  {
    id: 'dropoff',
    tabLabel: 'Barangay Drop-Off',
    title: 'Nine Commonwealth Bases Across the Barangay',
    summary:
      'Locate staffed Material Recovery Facilities and 24/7 Smart Bin stations across Barangay Commonwealth, from Brgy. Hall Complex and Katuparan to Lupang Pangako.',
    highlights: [
      'Official coverage across all 9 Barangay Commonwealth bases',
      'Filter by Open Now, Staffed desk, or 24/7 Smart Bin',
      'One-tap slot scheduling synced with MRF intake queues',
    ],
    ctaLabel: 'Launch Drop-Off Finder',
    ctaRoute: '/drop-offs',
  },
]

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Resident Tools',
    links: [
      { label: '2-Angle Device Scanner', to: '/scan' },
      { label: 'Schedule a Drop-Off', to: '/dropoff-schedule' },
      { label: 'Community Reuse Hub', to: '/reuse' },
      { label: '9-Base Drop-Off Finder', to: '/drop-offs' },
    ],
  },
  {
    heading: 'Account & Passes',
    links: [
      { label: 'Resident Dashboard', to: '/dashboard' },
      { label: 'My Requests & Passes', to: '/requests' },
      { label: 'Sign In', to: '/signin' },
      { label: 'Create Account', to: '/register' },
    ],
  },
  {
    heading: 'MRF Operations',
    links: [
      { label: 'Admin Overview', to: '/admin' },
      { label: 'Incoming Drop-Offs', to: '/admin/incoming' },
      { label: 'Inspection Queue', to: '/admin/to-inspect' },
      { label: 'Transactions & Reuse', to: '/admin/transactions' },
    ],
  },
]
