import type { BadgeVariant } from '@/components/ui/StatusBadge'
import type { StepItem } from '@/components/ui/StepperTracker'

import ecobyteLogo from '@/assets/ui/ecobyte_logo.svg'
import thinkpadImg from '@/assets/ui/thinkpad.jpeg'
import thinkpadDetailImg from '@/assets/ui/thinkpad_detail.jpeg'
import galaxyImg from '@/assets/ui/galaxy_s10.jpeg'
import ipadImg from '@/assets/ui/ipad.jpeg'
import keychronImg from '@/assets/ui/keychron.jpeg'
import chargerImg from '@/assets/ui/charger.jpeg'
import diagnosticViewImg from '@/assets/ui/diagnostic_view.jpeg'
import angleFrontImg from '@/assets/ui/angle_front.jpeg'
import angleBackImg from '@/assets/ui/angle_back.jpeg'
import angleLeftImg from '@/assets/ui/angle_left.jpeg'
import angleRightImg from '@/assets/ui/angle_right.jpeg'
import cameraViewfinderSvg from '@/assets/ui/camera_viewfinder.svg'
import dropoffMapSvg from '@/assets/ui/dropoff_map.svg'

export const LANDING_ASSETS = {
  ecobyteLogo,
  thinkpadImg,
  thinkpadDetailImg,
  galaxyImg,
  ipadImg,
  keychronImg,
  chargerImg,
  diagnosticViewImg,
  angleFrontImg,
  angleBackImg,
  angleLeftImg,
  angleRightImg,
  cameraViewfinderSvg,
  dropoffMapSvg,
} as const

export type ShowcaseDeviceId =
  | 'thinkpad-t480'
  | 'galaxy-s10'
  | 'ipad-air'
  | 'keychron-k2'
  | 'gan-charger-65w'

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
  deviceId?: ShowcaseDeviceId
}

export interface MarqueeLocationBadge {
  id: string
  zoneTag: string
  label: string
}

export interface ShowcaseDeviceItem {
  id: ShowcaseDeviceId
  name: string
  categoryLabel: string
  image: string
  detailImage?: string
  conditionGrade: string
  conditionNote: string
  batteryHealth: string
  batteryPercent: number
  ecoPoints: string
  routingVerdict: string
  badgeVariant: BadgeVariant
  recommendedHub: string
  hubDistance: string
  ctaLabel: string
  ctaRoute: string
}

export interface RecoveryLoopStep {
  stepNumber: '01' | '02' | '03'
  title: string
  description: string
}

export interface CommonwealthSiteSummary {
  id: string
  name: string
  distance: string
  hours: string
  accessType: string
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
  if (targetRoute.startsWith('/admin')) {
    return `/admin/signin?redirect=${encodeURIComponent(targetRoute)}`
  }
  return `/signin?redirect=${encodeURIComponent(targetRoute)}`
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI Triage', href: '#ai-triage' },
  { label: 'Reuse Hub', href: '#device-switcher' },
  { label: 'Commonwealth Map', href: '#commonwealth-map' },
  { label: 'Barangay Pilot', href: '#pilot' },
]

export const HERO_PROOF_THUMBNAILS: { src: string; alt: string }[] = [
  { src: thinkpadImg, alt: 'Inspected Lenovo ThinkPad T480' },
  { src: galaxyImg, alt: 'Tested Samsung Galaxy S10' },
  { src: ipadImg, alt: 'Verified iPad Air' },
  { src: keychronImg, alt: 'Keychron K2 mechanical keyboard' },
]

export const DEVICE_CATEGORY_PILLS: CategoryPillItem[] = [
  {
    id: 'cat-laptops',
    label: 'Laptops & PCs',
    icon: 'laptop',
    targetSectionId: 'device-switcher',
    deviceId: 'thinkpad-t480',
  },
  {
    id: 'cat-smartphones',
    label: 'Smartphones',
    icon: 'smartphone',
    targetSectionId: 'device-switcher',
    deviceId: 'galaxy-s10',
  },
  {
    id: 'cat-tablets',
    label: 'Tablets',
    icon: 'tablet',
    targetSectionId: 'device-switcher',
    deviceId: 'ipad-air',
  },
  {
    id: 'cat-keyboards',
    label: 'Keyboards',
    icon: 'keyboard',
    targetSectionId: 'device-switcher',
    deviceId: 'keychron-k2',
  },
  {
    id: 'cat-chargers',
    label: 'Chargers & Cables',
    icon: 'charger',
    targetSectionId: 'device-switcher',
    deviceId: 'gan-charger-65w',
  },
  {
    id: 'cat-batteries',
    label: 'Batteries & E-Waste',
    icon: 'battery',
    targetSectionId: 'ai-triage',
  },
]

export const MARQUEE_ROW_ONE: MarqueeLocationBadge[] = [
  { id: 'm1-area1', zoneTag: 'Area 1', label: 'Brgy Hall Complex' },
  { id: 'm1-area2', zoneTag: 'Area 2', label: 'Lupang Pangako' },
  { id: 'm1-area3', zoneTag: 'Area 3', label: 'Payatas Border' },
  { id: 'm1-area4', zoneTag: 'Area 4', label: 'Don Fabian / Litex' },
  { id: 'm1-area5', zoneTag: 'Area 5', label: 'Commonwealth Market / MRT-7' },
  { id: 'm1-area6', zoneTag: 'Area 6', label: 'Pilot Area Eco-Depot' },
  { id: 'm1-area7', zoneTag: 'Area 7', label: 'Kasunduan / Batasan Rd' },
]

export const MARQUEE_ROW_TWO: MarqueeLocationBadge[] = [
  { id: 'm2-area8', zoneTag: 'Area 8', label: 'Holy Spirit Junction' },
  { id: 'm2-area9', zoneTag: 'Area 9', label: 'Veterans Village' },
  { id: 'm2-mrf', zoneTag: 'Central', label: 'MRF Central Commonwealth' },
  { id: 'm2-epwmd', zoneTag: 'Quezon City', label: 'QC EPWMD Partner' },
  { id: 'm2-denr', zoneTag: 'Accredited', label: 'DENR-EMB Recovery Line' },
  { id: 'm2-residents', zoneTag: 'Exclusive', label: 'Barangay Commonwealth Residents' },
  { id: 'm2-lockers', zoneTag: '24/7 Access', label: 'Smart Locker Hubs' },
]

export const SHOWCASE_DEVICES: ShowcaseDeviceItem[] = [
  {
    id: 'thinkpad-t480',
    name: 'Lenovo ThinkPad T480',
    categoryLabel: '14" Business Laptop',
    image: thinkpadImg,
    detailImage: thinkpadDetailImg,
    conditionGrade: 'Grade B+',
    conditionNote: 'Inspected chassis & hinges',
    batteryHealth: '85% Healthy',
    batteryPercent: 85,
    ecoPoints: '+180 EcoPoints',
    routingVerdict: 'Community Reuse',
    badgeVariant: 'available',
    recommendedHub: 'Area 1 Eco-Hub',
    hubDistance: '0.8 km',
    ctaLabel: 'View in Reuse Hub',
    ctaRoute: '/reuse',
  },
  {
    id: 'galaxy-s10',
    name: 'Samsung Galaxy S10',
    categoryLabel: '128GB Android Smartphone',
    image: galaxyImg,
    conditionGrade: 'Grade B',
    conditionNote: 'Screen glass verified intact',
    batteryHealth: '79% Normal',
    batteryPercent: 79,
    ecoPoints: '+140 EcoPoints',
    routingVerdict: 'Community Reuse',
    badgeVariant: 'available',
    recommendedHub: 'Area 5 MRT-7 Base',
    hubDistance: '1.8 km',
    ctaLabel: 'View in Reuse Hub',
    ctaRoute: '/reuse',
  },
  {
    id: 'ipad-air',
    name: 'iPad Air 64GB',
    categoryLabel: '10.9" Wi-Fi Tablet',
    image: ipadImg,
    conditionGrade: 'Grade A-',
    conditionNote: 'Minor rear bezel mark only',
    batteryHealth: '91% Healthy',
    batteryPercent: 91,
    ecoPoints: '+150 EcoPoints',
    routingVerdict: 'Community Reuse',
    badgeVariant: 'available',
    recommendedHub: 'Area 1 Eco-Hub',
    hubDistance: '0.8 km',
    ctaLabel: 'Claim in Reuse Hub',
    ctaRoute: '/reuse',
  },
  {
    id: 'keychron-k2',
    name: 'Keychron K2 V2',
    categoryLabel: '75% Wireless Mechanical Keyboard',
    image: keychronImg,
    conditionGrade: 'Grade A',
    conditionNote: 'All tactile switches tested',
    batteryHealth: '94% Healthy',
    batteryPercent: 94,
    ecoPoints: '+95 EcoPoints',
    routingVerdict: 'Repair Guide / Reuse',
    badgeVariant: 'green-pill',
    recommendedHub: 'Area 1 Eco-Hub Desk 2',
    hubDistance: '0.8 km',
    ctaLabel: 'Open Repair Guide',
    ctaRoute: '/reuse-guide',
  },
  {
    id: 'gan-charger-65w',
    name: '65W GaN USB-C Charger',
    categoryLabel: 'Dual-Port Power Adapter',
    image: chargerImg,
    conditionGrade: 'Safe & Tested',
    conditionNote: 'No thermal or prong damage',
    batteryHealth: 'No Internal Cell',
    batteryPercent: 100,
    ecoPoints: '+45 EcoPoints',
    routingVerdict: 'Safe Recovery',
    badgeVariant: 'electric',
    recommendedHub: 'Area 2 Lupang Pangako Bin',
    hubDistance: '1.1 km',
    ctaLabel: 'Scan Similar Accessory',
    ctaRoute: '/scan',
  },
]

export const RECOVERY_LOOP_STEPS: RecoveryLoopStep[] = [
  {
    stepNumber: '01',
    title: '6-Angle Scan & AI Triage',
    description:
      'Capture Front, Back, Left, Right, Top, and Bottom views to receive a condition grade and lithium battery safety check.',
  },
  {
    stepNumber: '02',
    title: 'Smart Locker or MRF Schedule',
    description:
      'Reserve a 24/7 Smart Bin slot or book a staffed drop-off desk across Barangay Commonwealth with pass #ECO-4821.',
  },
  {
    stepNumber: '03',
    title: 'Physical Turn-Over & EcoPoints',
    description:
      'Desk officers confirm physical intake at the barangay facility and credit verified EcoPoints to your resident ledger.',
  },
]

export const LANDING_TRACKER_STEPS: StepItem[] = [
  { id: 1, label: 'Submitted' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Scheduled' },
  { id: 4, label: 'Collected' },
  { id: 5, label: 'Turned over' },
]

export const SHOWCASE_ANGLE_THUMBS: { label: string; src: string }[] = [
  { label: 'Front', src: angleFrontImg },
  { label: 'Back', src: angleBackImg },
  { label: 'Left', src: angleLeftImg },
  { label: 'Right', src: angleRightImg },
]

export const COMMONWEALTH_SHOWCASE_SITES: CommonwealthSiteSummary[] = [
  {
    id: 'cw-site-1',
    name: 'Area 1 Eco-Hub (Brgy Hall Complex)',
    distance: '0.8 km',
    hours: '8:00 AM - 5:00 PM',
    accessType: 'Staffed & Smart Bin',
  },
  {
    id: 'cw-site-2',
    name: 'Area 2 Lupang Pangako E-Collection Base',
    distance: '1.1 km',
    hours: '24/7 Smart Bin Access',
    accessType: '24/7 Smart Bin',
  },
  {
    id: 'cw-site-5',
    name: 'Area 5 Commonwealth Market / MRT-7 Base',
    distance: '1.8 km',
    hours: '6:00 AM - 8:00 PM',
    accessType: 'Staffed & Smart Bin',
  },
]

export const WALKTHROUGH_MODES: WalkthroughModeItem[] = [
  {
    id: 'diagnostic',
    tabLabel: 'Diagnostic Report',
    title: 'Screen Battery Hazards Before Transport',
    summary:
      'Six guided angles let EcoByte inspect casing gaps, port wear, and lithium swelling risk before an item enters a neighborhood bin.',
    highlights: [
      'Session #SCAN-9042 verifies all 6 exterior angles',
      'Flags 68% battery wear for isolated MRF handling',
      'Assigns fair EcoPoints before you leave home',
    ],
    ctaLabel: 'Open AI Diagnostic View',
    ctaRoute: '/diagnostic',
  },
  {
    id: 'pass',
    tabLabel: 'Reuse Pass #ECO-4821',
    title: 'Claim Working Tech with a Verified Locker Pass',
    summary:
      'Verified Barangay Commonwealth residents reserve tested hardware from the Community Reuse Hub and present a digital pass at Desk 2 for accountable handoff.',
    highlights: [
      'Digital pass #ECO-4821 locked to your resident account',
      '48-hour reservation window at Barangay Commonwealth MRF',
      'Photo proof-of-claim closes the circular loop',
    ],
    ctaLabel: 'View Sample Reservation Pass',
    ctaRoute: '/reservation-code',
  },
  {
    id: 'dropoff',
    tabLabel: 'Barangay Drop-Off',
    title: 'Nine Commonwealth Areas Within Walking Reach',
    summary:
      'Locate the closest staffed Material Recovery Facility or 24/7 Smart Locker cluster across Katuparan, Litex, Lupang Pangako, and Batasan.',
    highlights: [
      'Live distance sorting across all 9 barangay clusters',
      'Filter by 24/7 Smart Bin or lithium-accredited desk',
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
      { label: '6-Angle Device Scanner', to: '/scan' },
      { label: 'AI Diagnostic Results', to: '/diagnostic' },
      { label: 'Community Reuse Hub', to: '/reuse' },
      { label: '9-Area Drop-Off Finder', to: '/drop-offs' },
    ],
  },
  {
    heading: 'Account & Passes',
    links: [
      { label: 'Resident Dashboard', to: '/dashboard' },
      { label: 'Sign In', to: '/signin' },
      { label: 'Create Account', to: '/register' },
      { label: 'Reservation Pass', to: '/reservation-code' },
    ],
  },
  {
    heading: 'MRF Operations',
    links: [
      { label: 'Admin Overview', to: '/admin' },
      { label: 'Inspection Queue', to: '/admin/to-inspect' },
      { label: 'Reuse Inventory', to: '/admin/reuse-hub' },
      { label: 'Hazardous Disposal', to: '/admin/disposal' },
    ],
  },
]
