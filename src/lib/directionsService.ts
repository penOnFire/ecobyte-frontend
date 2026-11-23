// Directions service for Barangay Commonwealth Drop-off Sites
// Queries public OSRM routing with a local road-network fallback

export interface LatLng {
  lat: number
  lng: number
}

export interface RouteWaypoint {
  id: string
  name: string
  address: string
  category: 'gps' | 'base' | 'landmark'
  coordinates: [number, number]
}

export const COMMONWEALTH_ROUTE_WAYPOINTS: RouteWaypoint[] = [
  {
    id: 'user_gps',
    name: '📍 My Current Location (GPS)',
    address: 'Live device coordinates',
    category: 'gps',
    coordinates: [14.697, 121.0882],
  },
  {
    id: 'base_1',
    name: 'Base 1: Area 1 Eco-Hub (Brgy Hall)',
    address: 'Commonwealth Ave. cor. Katuparan St.',
    category: 'base',
    coordinates: [14.697, 121.0882],
  },
  {
    id: 'base_2',
    name: 'Base 2: Area 2 Lupang Pangako Base',
    address: 'Riverside St., Lupang Pangako',
    category: 'base',
    coordinates: [14.6955, 121.0825],
  },
  {
    id: 'base_3',
    name: 'Base 3: Area 3 Payatas Border Station',
    address: 'Payatas Rd. cor. Commonwealth Border',
    category: 'base',
    coordinates: [14.7085, 121.0895],
  },
  {
    id: 'base_4',
    name: 'Base 4: Area 4 Litex Market Exchange',
    address: 'Litex Road cor. Commonwealth Ave.',
    category: 'base',
    coordinates: [14.7005, 121.0875],
  },
  {
    id: 'base_5',
    name: 'Base 5: Area 5 Commonwealth Market / MRT-7',
    address: 'Commonwealth Market Complex',
    category: 'base',
    coordinates: [14.694, 121.0868],
  },
  {
    id: 'base_6',
    name: 'Base 6: Area 6 Pilot Area Community Depot',
    address: 'Pilot Area Main Drive, Commonwealth',
    category: 'base',
    coordinates: [14.698, 121.0775],
  },
  {
    id: 'base_7',
    name: 'Base 7: Area 7 Batasan Border E-Depot',
    address: 'Batasan-San Mateo Road',
    category: 'base',
    coordinates: [14.696, 121.091],
  },
  {
    id: 'base_8',
    name: 'Base 8: Area 8 Holy Spirit Junction Bin',
    address: 'Don Fabian St. cor. Commonwealth Ave.',
    category: 'base',
    coordinates: [14.7015, 121.0835],
  },
  {
    id: 'base_9',
    name: 'Base 9: Area 9 Veterans Village Hub',
    address: 'Sandiganbayan Access Rd., Veterans Village',
    category: 'base',
    coordinates: [14.6965, 121.085],
  },
  {
    id: 'landmark_litex',
    name: 'Litex Public Market',
    address: 'Commonwealth Ave., Litex',
    category: 'landmark',
    coordinates: [14.7005, 121.0875],
  },
  {
    id: 'landmark_sandigan',
    name: 'Sandiganbayan Centennial Bldg',
    address: 'Commonwealth Ave., Batasan border',
    category: 'landmark',
    coordinates: [14.6948, 121.0865],
  },
  {
    id: 'landmark_mrt7',
    name: 'Commonwealth Market / MRT-7 Station',
    address: 'Commonwealth Ave. Central',
    category: 'landmark',
    coordinates: [14.694, 121.0868],
  },
  {
    id: 'landmark_hall',
    name: 'Commonwealth Barangay Hall Complex',
    address: 'Katuparan St., Commonwealth',
    category: 'landmark',
    coordinates: [14.697, 121.0882],
  },
]

export interface DirectionRoute {
  coordinates: [number, number][]
  distanceKm: number
  distanceText: string
  durationMins: number
  durationText: string
  walkMins: number
  walkText: string
  originLabel: string
  destinationLabel: string
}

// Key arterial road spine waypoints along Commonwealth Avenue & major corridors
const COMMONWEALTH_AVENUE_SPINE: [number, number][] = [
  [14.7085, 121.0895], // North: Payatas border (Base 3)
  [14.704, 121.0885], // North Commonwealth Ave
  [14.7015, 121.0835], // Holy Spirit Junction (Base 8)
  [14.7005, 121.0875], // Litex Market (Base 4)
  [14.698, 121.0775], // Pilot Area (Base 6)
  [14.697, 121.0882], // Barangay Hall Complex (Base 1)
  [14.6965, 121.085], // Veterans Village (Base 9)
  [14.696, 121.091], // Batasan Border (Base 7)
  [14.6955, 121.0825], // Lupang Pangako (Base 2)
  [14.694, 121.0868], // Commonwealth Market / MRT-7 (Base 5)
  [14.6933, 121.086], // South: Sandiganbayan border
]

// Haversine distance in km
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Generate realistic road path along Commonwealth Avenue network if offline or OSRM unavailable
function generateRealisticCorridorRoute(
  origin: LatLng,
  destination: LatLng
): [number, number][] {
  // Find closest spine point to origin
  let closestOriginIdx = 0
  let minOriginDist = Infinity
  for (let i = 0; i < COMMONWEALTH_AVENUE_SPINE.length; i++) {
    const d = haversineDistance(origin, {
      lat: COMMONWEALTH_AVENUE_SPINE[i][0],
      lng: COMMONWEALTH_AVENUE_SPINE[i][1],
    })
    if (d < minOriginDist) {
      minOriginDist = d
      closestOriginIdx = i
    }
  }

  // Find closest spine point to destination
  let closestDestIdx = 0
  let minDestDist = Infinity
  for (let i = 0; i < COMMONWEALTH_AVENUE_SPINE.length; i++) {
    const d = haversineDistance(destination, {
      lat: COMMONWEALTH_AVENUE_SPINE[i][0],
      lng: COMMONWEALTH_AVENUE_SPINE[i][1],
    })
    if (d < minDestDist) {
      minDestDist = d
      closestDestIdx = i
    }
  }

  const path: [number, number][] = [[origin.lat, origin.lng]]

  // If origin is not already directly on the spine, connect to closest spine point
  if (minOriginDist > 0.05) {
    path.push(COMMONWEALTH_AVENUE_SPINE[closestOriginIdx])
  }

  // Traverse spine points between origin and destination
  const step = closestOriginIdx <= closestDestIdx ? 1 : -1
  for (let i = closestOriginIdx; i !== closestDestIdx; i += step) {
    path.push(COMMONWEALTH_AVENUE_SPINE[i])
  }
  path.push(COMMONWEALTH_AVENUE_SPINE[closestDestIdx])

  // Finally reach destination
  path.push([destination.lat, destination.lng])

  // Filter out any duplicate adjacent points
  const cleaned: [number, number][] = []
  for (let i = 0; i < path.length; i++) {
    if (
      i === 0 ||
      path[i][0] !== path[i - 1][0] ||
      path[i][1] !== path[i - 1][1]
    ) {
      cleaned.push(path[i])
    }
  }

  return cleaned
}

export async function fetchCommonwealthRoute(
  origin: LatLng,
  destination: LatLng,
  originLabel = 'Your Location',
  destinationLabel = 'Drop-off Base'
): Promise<DirectionRoute> {
  const directDist = haversineDistance(origin, destination)

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const rawCoords: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        )
        const distanceKm = Number((route.distance / 1000).toFixed(1))
        const durationMins = Math.max(1, Math.round(route.duration / 60))
        const walkMins = Math.max(1, Math.round((distanceKm / 4.5) * 60))

        return {
          coordinates: rawCoords,
          distanceKm,
          distanceText: `${distanceKm} km`,
          durationMins,
          durationText: `${durationMins} min${durationMins > 1 ? 's' : ''}`,
          walkMins,
          walkText: `${walkMins} min${walkMins > 1 ? 's' : ''}`,
          originLabel,
          destinationLabel,
        }
      }
    }
  } catch (err) {
    // Fallback if network blocked, offline, CORS, or timed out
    console.info('Using local Commonwealth road corridor route fallback:', err)
  }

  // Realistic fallback route
  const coords = generateRealisticCorridorRoute(origin, destination)
  let totalKm = 0
  for (let i = 1; i < coords.length; i++) {
    totalKm += haversineDistance(
      { lat: coords[i - 1][0], lng: coords[i - 1][1] },
      { lat: coords[i][0], lng: coords[i][1] }
    )
  }
  const distanceKm = Number(Math.max(directDist * 1.15, totalKm).toFixed(1))
  const durationMins = Math.max(2, Math.round((distanceKm / 22) * 60)) // ~22 km/h city speed
  const walkMins = Math.max(3, Math.round((distanceKm / 4.5) * 60))

  return {
    coordinates: coords,
    distanceKm,
    distanceText: `${distanceKm} km`,
    durationMins,
    durationText: `${durationMins} min${durationMins > 1 ? 's' : ''}`,
    walkMins,
    walkText: `${walkMins} min${walkMins > 1 ? 's' : ''}`,
    originLabel,
    destinationLabel,
  }
}
