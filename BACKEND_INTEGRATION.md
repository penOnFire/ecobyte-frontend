# EcoByte API & Backend Integration Specification

Welcome to the backend integration guide for **EcoByte**, a circular electronics and e-waste lifecycle management platform. This document defines the architectural conventions, data models, state machines, and RESTful API endpoints required to power the mobile-first frontend client.

---

## 1. Architectural Conventions

### Base URL & Environment
All API calls are prefixed with the API version path:
```
Development: http://localhost:8000/api/v1
Production:  https://api.ecobyte.ph/api/v1
```
Configure on the client via `VITE_API_BASE_URL` in `.env`.

### Authentication
- Authentication is token-based via JSON Web Tokens (**JWT**).
- Authenticated requests must include the HTTP header:
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  ```
- Token expiration: Access Token (1 hour), Refresh Token (30 days).

### Standard JSON Response Envelope
All endpoints must return responses encapsulated in the standard envelope:

#### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully.",
  "timestamp": "2026-11-10T20:25:00.000Z"
}
```

#### Error Response (`400`, `401`, `403`, `404`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "DEVICE_ALREADY_RESERVED",
    "message": "This device has already been claimed or held by another resident.",
    "details": []
  },
  "timestamp": "2026-11-10T20:25:00.000Z"
}
```

---

## 2. Core Domain Data Models & State Machines

### 2.1 E-Waste Drop-Off Lifecycle State Machine
```
[ SUBMITTED ] ───────────► [ UNDER_REVIEW ]
                                 │
                                 ▼
                          [ SCHEDULED ]
                                 │
                                 ▼
                          [ COLLECTED ]
                                 │
                                 ▼
                         [ TURNED_OVER ]
```
- **SUBMITTED**: Resident completed multi-angle AI scan and submitted question responses.
- **UNDER_REVIEW**: Automated risk assessment verifying battery hazard & circuit condition.
- **SCHEDULED**: Resident selected an intake date and official hub slot.
- **COLLECTED**: Staff at the accredited hub received the device and scanned receipt barcode.
- **TURNED_OVER**: Certified e-waste recycler has processed or refurbished the hardware.

### 2.2 Reuse Hub Reservation State Machine
```
[ AVAILABLE ] ──► [ RESERVED ] ──► [ CLAIMED ]
                       │
                       │ (48 hours expired without claim proof)
                       ▼
                 [ AVAILABLE ]
```
- **AVAILABLE**: Refurbished item listed with verified diagnostics and hardware rating.
- **RESERVED**: Resident locked the item; system generates 48-hour pickup code (e.g., `ECO-4821`).
- **CLAIMED**: Resident uploaded proof of claim photo at the designated locker/hub.
- **EXPIRED**: Background worker releases item back to `AVAILABLE` if unclaimed within 48h.

---

## 3. Endpoints Matrix

### Module 1: Authentication & Barangay Profile (`/auth`)

#### `POST /auth/login`
Authenticates a resident and returns user profile with JWT tokens.
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "SecretPassword123",
    "rememberMe": true
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "d8a1f8...",
      "user": {
        "id": "usr_99182",
        "fullName": "Alex Mercer",
        "email": "alex@example.com",
        "phone": "+63 912 345 6789",
        "barangay": {
          "id": "brgy_san_antonio",
          "name": "Barangay San Antonio",
          "city": "Pasig City"
        }
      }
    }
  }
  ```

#### `POST /auth/register`
Creates a resident account tied to their local barangay.
- **Request Body**:
  ```json
  {
    "fullName": "Alex Mercer",
    "email": "alex@example.com",
    "phone": "+63 912 345 6789",
    "barangayId": "brgy_san_antonio",
    "password": "SecretPassword123"
  }
  ```
- **Response `201 Created`**: Returns user profile and access tokens.

#### `GET /auth/me`
Fetches authenticated session profile and barangay context.
- **Headers**: `Authorization: Bearer <TOKEN>`

---

### Module 2: AI Multi-Angle Telemetry & Diagnostic (`/assessments`)

#### `POST /assessments/scan-angles`
Uploads multi-angle camera captures for computer vision assessment.
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**:
  - `sessionId`: `string` (UUID)
  - `angle`: `"front" | "back" | "left" | "right" | "top" | "bottom"`
  - `image`: Binary file (JPEG/PNG)
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "scan_9042",
      "uploadedAngle": "back",
      "opticalLockConfidence": 0.984,
      "completedAngles": ["front", "back"],
      "remainingAngles": ["left", "right", "top", "bottom"]
    }
  }
  ```

#### `POST /assessments/submit`
Submits hardware telemetry questions and initiates AI diagnostic inference.
- **Request Body**:
  ```json
  {
    "sessionId": "scan_9042",
    "powersOn": true,
    "displayIntact": true,
    "portsWorking": false,
    "visibleDamage": ["chassis_dent", "swollen_battery"],
    "missingParts": ["charger_cable"],
    "notes": "Battery began slightly pushing out back cover after overheating."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "assessmentId": "asm_48102",
      "deviceModel": "Apple iPhone 11 Pro",
      "wasteClassification": "Class III (Hazardous Lithium-Ion)",
      "hazardAlert": {
        "level": "CRITICAL",
        "title": "Lithium-Ion Swelling Detected",
        "instructions": "Do not puncture or compress. Pack in non-conductive sleeve."
      },
      "subsystems": [
        { "name": "Battery Cell", "status": "HEALTH_RISK", "score": 42 },
        { "name": "OLED Matrix", "status": "OPTIMAL", "score": 96 },
        { "name": "Logic Board", "status": "INTACT", "score": 88 },
        { "name": "Sensors & Port", "status": "DEGRADED", "score": 58 }
      ],
      "recommendedRoute": "DROP_OFF"
    }
  }
  ```

---

### Module 3: Drop-Off Hubs & Logistics Scheduler (`/dropoffs`)

#### `GET /dropoffs/sites`
Returns accredited e-waste collection sites filtered by geolocation and amenities.
- **Query Parameters**:
  - `lat` (number), `lng` (number)
  - `filter`: `"all" | "open_now" | "staffed" | "smart_bin"`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "site_pasig_green_hub",
        "name": "San Antonio Eco-Hub",
        "address": "Bgy. San Antonio, Pasig City",
        "distanceKm": 0.8,
        "hours": "8:00 AM - 5:00 PM",
        "type": "Staffed & Smart Bin",
        "isOpen": true,
        "coordinates": { "lat": 14.5804, "lng": 121.0628 },
        "hazmatAccredited": true
      },
      {
        "id": "site_ortigas_exchange",
        "name": "Ortigas Green Exchange",
        "address": "Emerald Ave, Ortigas Center",
        "distanceKm": 1.6,
        "hours": "24/7 Smart Bin Access",
        "type": "24/7 Smart Bin",
        "isOpen": true,
        "coordinates": { "lat": 14.5869, "lng": 121.0601 },
        "hazmatAccredited": false
      }
    ]
  }
  ```

#### `POST /dropoffs/schedule`
Reserves an official intake appointment slot for certified drop-off.
- **Request Body**:
  ```json
  {
    "assessmentId": "asm_48102",
    "siteId": "site_pasig_green_hub",
    "scheduledDate": "2026-10-24",
    "timeSlot": "15:30",
    "courierOrSelf": "SELF_DROPOFF"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "requestId": "2041",
      "status": "SCHEDULED",
      "step": "2/3",
      "site": {
        "name": "San Antonio Eco-Hub",
        "counter": "Desk B - Hazardous Intake"
      },
      "scheduledTime": "Today, 3:30 PM",
      "logisticsPartner": "Pasig City Environmental Services"
    }
  }
  ```

#### `GET /requests/my-requests`
Lists all active, ongoing, and completed e-waste requests for the authenticated resident.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "ongoing": [
        {
          "requestId": "2041",
          "deviceTitle": "MacBook Pro 13″",
          "siteName": "San Antonio Hub",
          "status": "Scheduled",
          "statusStage": "Drop-off confirmed",
          "progressStep": "2/3",
          "progressPercent": 66,
          "scheduledSlot": "Today, 3:30 PM • Pasig Green Hub"
        },
        {
          "requestId": "2042",
          "deviceTitle": "Galaxy A52",
          "siteName": "Bel-Air Drop Site",
          "status": "Under review",
          "statusStage": "Submitted",
          "progressStep": "1/3",
          "progressPercent": 33,
          "scheduledSlot": "Assessment submitted · AI diagnostic completed"
        }
      ],
      "completed": []
    }
  }
  ```

---

### Module 4: Reuse Hub Marketplace & Reservations (`/reuse`)

#### `GET /reuse/items`
Returns available refurbished devices for community claims.
- **Query Parameters**:
  - `category`: `"All" | "Laptops" | "Phones" | "Chargers" | "Peripherals"`
  - `query`: `string`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "totalVerified": 48,
      "divertedKgThisWeek": 14.2,
      "items": [
        {
          "id": "thinkpad-t480",
          "title": "Lenovo ThinkPad T480",
          "category": "Laptops",
          "condition": "Inspected & Working",
          "subcondition": "Battery 85%",
          "location": "Pasig Green Hub",
          "distance": "0.6 km",
          "price": "Free",
          "status": "Available",
          "imageUrl": "https://cdn.ecobyte.ph/items/thinkpad.jpeg"
        },
        {
          "id": "galaxy-s10",
          "title": "Samsung Galaxy S10",
          "category": "Phones",
          "condition": "Screen Replaced",
          "subcondition": "Clean Condition",
          "location": "Ortigas Drop-off Center",
          "distance": "1.2 km",
          "price": "Free",
          "status": "Available",
          "imageUrl": "https://cdn.ecobyte.ph/items/galaxy_s10.jpeg"
        }
      ]
    }
  }
  ```

#### `GET /reuse/items/:id`
Retrieves detailed technical specifications, warranty guarantee, and locker availability.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "thinkpad-t480",
      "title": "Lenovo ThinkPad T480",
      "category": "Laptops",
      "itemCode": "CIR-84920",
      "hub": {
        "name": "Pasig Green Hub",
        "lockerBay": "Bay 3, Locker #12",
        "distance": "0.6 km"
      },
      "guaranteeDays": 30,
      "specs": {
        "processor": "Intel Core i5-8350U",
        "memory": "16GB DDR4",
        "storage": "256GB NVMe SSD",
        "batteryHealth": "85% (Dual Bridge)",
        "screen": "14\" FHD IPS Anti-Glare"
      },
      "availableSlots": [
        { "date": "2026-10-23", "times": ["10:00 AM", "2:00 PM", "4:30 PM"] },
        { "date": "2026-10-24", "times": ["9:00 AM", "1:30 PM", "5:00 PM"] }
      ]
    }
  }
  ```

#### `POST /reuse/reservations`
Places an exclusive 48-hour reservation hold and generates an official pick-up code.
- **Request Body**:
  ```json
  {
    "itemId": "thinkpad-t480",
    "pickupDate": "2026-10-23",
    "pickupTime": "2:00 PM"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "reservationId": "res_84920",
      "pickupCode": "ECO-4821",
      "status": "RESERVED",
      "expiresAt": "2026-10-25T14:00:00.000Z",
      "hoursRemaining": 48,
      "pickupLocation": {
        "name": "San Antonio Hub",
        "address": "45 F. Ortigas Jr. Rd, Pasig City",
        "desk": "Desk B • Locker #12"
      }
    }
  }
  ```

#### `POST /reuse/reservations/:id/proof-of-claim`
Uploads proof of claim photo verifying receipt or physical device handoff.
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**:
  - `photo`: Binary image file (JPEG/PNG/HEIC, max 10MB)
  - `pickupCode`: `"ECO-4821"`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "reservationId": "res_84920",
      "status": "CLAIMED",
      "divertedKg": 14.8,
      "claimedAt": "2026-10-23T14:15:00.000Z"
    }
  }
  ```

---

## 4. Database Schema Recommendation (PostgreSQL / Prisma)

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  fullName     String
  phone        String
  passwordHash String
  barangayId   String
  barangay     Barangay      @relation(fields: [barangayId], references: [id])
  requests     EwasteRequest[]
  reservations Reservation[]
  createdAt    DateTime      @default(now())
}

model Barangay {
  id        String   @id @default(cuid())
  name      String
  city      String
  users     User[]
  dropSites DropSite[]
}

model DropSite {
  id               String          @id @default(cuid())
  name             String
  address          String
  latitude         Float
  longitude        Float
  hours            String
  type             String          // "Staffed & Smart Bin" | "24/7 Smart Bin"
  isHazmatReady    Boolean         @default(true)
  barangayId       String
  barangay         Barangay        @relation(fields: [barangayId], references: [id])
  requests         EwasteRequest[]
  reuseItems       ReuseItem[]
}

model EwasteRequest {
  id              String          @id @default(cuid())
  trackingNumber  String          @unique // e.g. "2041"
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  dropSiteId      String
  dropSite        DropSite        @relation(fields: [dropSiteId], references: [id])
  deviceModel     String
  status          RequestStatus   @default(SUBMITTED)
  scheduledSlot   DateTime?
  hazardLevel     String          @default("LOW")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model ReuseItem {
  id            String         @id @default(cuid())
  itemCode      String         @unique // e.g. "CIR-84920"
  title         String
  category      String
  condition     String
  batteryHealth String?
  dropSiteId    String
  dropSite      DropSite       @relation(fields: [dropSiteId], references: [id])
  status        ItemStatus     @default(AVAILABLE)
  reservation   Reservation?
  createdAt     DateTime       @default(now())
}

model Reservation {
  id          String            @id @default(cuid())
  pickupCode  String            @unique // e.g. "ECO-4821"
  userId      String
  user        User              @relation(fields: [userId], references: [id])
  itemId      String            @unique
  item        ReuseItem         @relation(fields: [itemId], references: [id])
  status      ReservationStatus @default(RESERVED)
  proofPhoto  String?
  expiresAt   DateTime
  createdAt   DateTime          @default(now())
}

enum RequestStatus {
  SUBMITTED
  UNDER_REVIEW
  SCHEDULED
  COLLECTED
  TURNED_OVER
}

enum ItemStatus {
  AVAILABLE
  RESERVED
  CLAIMED
}

enum ReservationStatus {
  RESERVED
  CLAIMED
  EXPIRED
}
```

---

## 5. Security & Verification Checklist
1. **File Upload Sanity**: Validate MIME types strictly on `image/jpeg`, `image/png`, `image/webp`. Reject executable files.
2. **Rate Limiting**: Apply standard throttling (`60 req/min`) on `/auth/login` and `/auth/register`.
3. **CORS Headers**: Set `Access-Control-Allow-Origin` to allow the Vite development domain (`http://localhost:5173`) and the production frontend domain.
4. **Automated Expiry Worker**: Run a scheduled cron task every 5 minutes to set `Reservation` status to `EXPIRED` and unlock `ReuseItem` to `AVAILABLE` if `expiresAt < NOW()` and `status == 'RESERVED'`.

