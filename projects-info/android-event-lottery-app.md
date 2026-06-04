# Android Event Lottery App (Quartz Lotto)

**Course:** CMPUT 301 — Introduction to Software Engineering, Fall 2024  
**Team:** quartz — Francis Garcia (fgarcia06), aaaamer1, ayraqutub, llLucidll, aditipadhii  
**Language:** Java (Android SDK)  
**Backend:** Firebase (Firestore, Storage, Cloud Messaging)  
**Methodology:** Agile — 5 sprints, GitHub project backlog, CRC cards, UML, UI storyboards

---

## What This Project Is About

Quartz Lotto is a full Android application that manages event sign-ups through a **lottery waitlist system**. Rather than first-come-first-served registration, entrants join a waitlist by scanning a QR code, and the organizer runs a random draw to select attendees. This removes the advantage of who joins first and gives everyone a fair chance.

Three user roles exist in the app:

- **Entrant** — scans QR codes to join event waitlists, receives notifications when selected or not selected, can confirm or decline their spot
- **Organizer** — creates events, generates QR codes, manages their facility, views the waitlist grouped by status, triggers the lottery draw
- **Admin** — browses and removes any users, events, facilities, or images in the system; manages QR code links

The core lottery flow:
1. Organizer creates an event (name, date, capacity, optional waitlist cap, optional geolocation requirement) and generates a QR code
2. Entrants scan the QR code → join waitlist with status `waiting`
3. On draw day, organizer triggers the lottery → system randomly shuffles waitlist, marks `maxAttendees` as `selected`, rest stay `waiting` or become `not_chosen`
4. Selected entrants get a push notification; non-selected also get notified
5. Selected entrants confirm or decline; declines trigger re-draws from the remaining waitlist

---

## Hardware / Runtime Components

| Component | Role |
|-----------|------|
| Android device (API 26+) | App runtime |
| Firebase Firestore | NoSQL cloud database — all users, events, facilities, waitlists, notifications |
| Firebase Storage | Image hosting — profile photos, event posters, facility images |
| Firebase Cloud Messaging (FCM) | Push notification delivery |
| CameraX | Camera preview and frame capture for QR scanning |
| ML Kit Barcode Scanning | On-device QR code decoding from camera frames |
| ZXing / `journeyapps` | QR code generation during event creation |
| Glide | Async image loading and caching |
| osmdroid | Offline map tiles for entrant location display |
| Google Maps API | Map geolocation display (declared in manifest) |
| GitHub Actions | CI: automated Android build on push |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Android App                               │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│  │   Models     │   │  Controllers │   │      Views         │   │
│  │              │   │              │   │  (Activities +     │   │
│  │ User         │   │ EntrantList  │   │   Fragments)       │   │
│  │ Event        │   │ Controller   │   │                    │   │
│  │ Facility     │   │ HomePage     │   │ MainActivity       │   │
│  │ EntrantList  │   │ Controller   │   │ HomeFragment       │   │
│  │ Attendee     │   │ BrowseEvents │   │ EventDetailsActivity│  │
│  │ StorageImage │   │ Controller   │   │ CreateEventActivity│   │
│  │              │   │ EditProfile  │   │ EventSignupActivity│   │
│  └──────────────┘   │ Controller   │   │ QRScannerFragment  │   │
│                     │ ...          │   │ WaitlistFragment   │   │
│                     └──────┬───────┘   │ EntrantsMapFragment│   │
│                            │           │ AdminProfileActivity│  │
│  ┌─────────────────────────▼──────┐    │ BrowseUsersActivity│   │
│  │         Repositories           │    │ BrowseEventsActivity│  │
│  │                                │    └────────────────────┘   │
│  │ EntrantListRepository          │                              │
│  │ FacilityRepository             │                              │
│  │ HomeRepository                 │                              │
│  │ UserRepository                 │                              │
│  └──────────────┬─────────────────┘                              │
│                 │  async callbacks                               │
└─────────────────│──────────────────────────────────────────────-┘
                  │
      ┌───────────▼──────────────────────┐
      │         Firebase                  │
      │                                   │
      │  Firestore                        │
      │    /users/{userId}                │
      │    /Events/{eventId}              │
      │      /Waitlist/{userId}           │
      │        status: waiting|selected|  │
      │               confirmed|cancelled │
      │        latitude, longitude        │
      │    /notifications/{id}            │
      │    /facilities/{facilityId}       │
      │                                   │
      │  Firebase Storage                 │
      │    profile images                 │
      │    event posters                  │
      │    facility images                │
      │                                   │
      │  Firebase Cloud Messaging         │
      │    push notifications to devices  │
      └───────────────────────────────────┘
```

### Lottery Draw Flow (Core Feature)

```
Organizer taps "Draw" on WaitlistFragment
    │
    ▼
EntrantListController.drawAttendees(eventId, redraw, context)
    │
    ▼
EntrantListRepository.sampleAttendees(eventId, size, context)
    │
    ├── getEntrantlist(eventId, "waiting")  ← Firestore query
    │         returns ArrayList<Attendee>
    │
    ├── Collections.shuffle(waitlist)       ← random shuffle
    │
    ├── selectedAttendees = subList(0, size)
    ├── unselectedAttendees = subList(size, end)
    │
    ├── updateAttendeeList():
    │       Firestore batch: status → "selected"
    │       sendNotificationWin() per user (if notificationsPerm=true)
    │
    └── updateWaitList():
            Firestore batch: status stays "waiting"
            sendNotificationLose() per user (if notificationsPerm=true)
```

### QR Code Flow

```
CreateEventActivity
    ├── ZXing BarcodeEncoder → generate QR bitmap
    │     content: "eventapp://event/{eventId}"
    ├── Upload QR bitmap to Firebase Storage
    └── Store qrCodeLink in Firestore Event document

QRScannerFragment (entrant's device)
    ├── CameraX ImageAnalysis → ML Kit BarcodeScanner
    ├── Parse: data.startsWith("eventapp://event/")
    │     → extract eventId
    └── Launch EventSignupActivity with eventId extra
```

---

## Project Components (Source Files)

```
src/main/java/com/example/myapplication/
│
├── Models/
│   ├── User.java           — User profile + EventAttendance inner class (status, lat, lon)
│   ├── Event.java          — Event data: name, dates, capacity, waitlist cap, geolocation flag, QR link
│   ├── Facility.java       — Facility: name, location, image URL
│   ├── EntrantList.java    — In-memory list + sampleAttendees(size) shuffle logic
│   ├── Attendee.java       — Attendee record: userId, userName, email, status
│   └── StorageImage.java   — Image URL wrapper for admin browse
│
├── Controllers/
│   ├── EntrantListController.java   — Draw logic, fetch by status
│   ├── HomePageController.java      — Home feed queries
│   ├── EditProfileController.java   — Profile save/update
│   ├── ManageFacilityController.java
│   ├── BrowseEventsController.java
│   ├── BrowseFacilitiesController.java
│   ├── BrowseUsersController.java
│   ├── BrowseImagesController.java
│   └── AddFacilityController.java
│
├── Repositories/
│   ├── EntrantListRepository.java   — All Firestore ops for waitlist: fetch, sample, update, notify
│   ├── FacilityRepository.java      — Facility CRUD
│   ├── HomeRepository.java          — Home feed event queries
│   └── UserRepository.java          — User profile read/write
│
├── Views/
│   ├── WaitingListView.java / WaitingListAdapter.java
│   ├── HomeView.java
│   ├── OrganizerProfileView.java
│   ├── EntrantProfileView.java
│   ├── ManageFacilityView.java / AddFacilityView.java
│   ├── BrowseEventsView.java / BrowseFacilitiesView.java
│   ├── BrowseUsersView.java / BrowseImagesView.java
│   └── (all extend Activity or implement view interfaces)
│
├── Activities (top-level UI):
│   ├── MainActivity.java           — Entry, device ID init, role routing
│   ├── HomeFragment.java           — Entrant home: event list, QR scanner nav
│   ├── CreateEventActivity.java    — Organizer: event form, QR generation, poster upload
│   ├── EventDetailsActivity.java   — Event info + waitlist tabs
│   ├── EventSignupActivity.java    — Entrant: join/leave waitlist
│   ├── EventWaitlistActivity.java  — Organizer: waitlist management
│   ├── GroupEntrantsActivity.java  — Grouped entrant status view
│   ├── QRScannerFragment.java      — CameraX + ML Kit live QR scanner
│   ├── EntrantsMapFragment.java    — osmdroid map: pin per signed-up entrant location
│   ├── AdminProfileActivity.java   — Admin home
│   ├── BrowseUsersActivity.java    — Admin: view/delete users
│   ├── BrowseEventsActivity.java   — Admin: view/delete events
│   ├── BrowseFacilitiesActivity.java
│   ├── BrowseImagesActivity.java
│   ├── ManageQrLinksActivity.java  — Admin: manage QR hashes
│   ├── EditProfileActivity.java
│   └── OrganizerNotificationActivity.java
│
├── Services:
│   ├── NotificationService.java    — Local notification builder + Firestore persistence
│   ├── MyFirebaseMessagingService.java — FCM token registration
│   └── NotificationUtils.java
│
├── Adapters:
│   ├── EventAdapter.java / EventAdapterAdmin.java
│   ├── AttendeesAdapter.java
│   ├── UserAdapter.java / FacilityAdapterAdmin.java
│   ├── ImageAdapter.java / QRLinkAdapter.java
│   ├── SelectedEventsAdapter.java
│   ├── WaitlistExpandableListAdapter.java
│   └── EventPagerAdapter.java
│
└── database/
    ├── DatabaseHelper.java    — Early waitlist write helper (addUserToWaitingList)
    └── DatabaseCallback.java  — onSuccess / onFailure interface

res/
├── layout/     — 30+ XML layouts (activities, fragments, list items)
├── drawable/   — Vector icons, backgrounds, gradients
├── navigation/ — Bottom nav menu definitions
└── values/     — Colors, strings, themes, arrays

doc/
├── CRC Cards.pdf              — Class Responsibility Collaborator design cards
├── UML.pdf                    — Class diagram
├── Sprint 1–5.pdf             — Agile sprint plans and retrospectives
└── Storyboard and UI Mockup.pdf
```

---

## Firestore Data Model

```
/users/{deviceId}
    name, email, phone, dob, country
    profileImageUrl
    isAdmin, isOrganizer, notificationsPerm
    eventsAttending: { eventId: { status, latitude, longitude } }

/Events/{eventId}
    eventName, drawDate, eventDateTime, description
    maxAttendees, maxWaitlist, currentAttendees, currentWaitlist
    geolocationEnabled, qrCodeLink, posterUrl
    organizerId
    facility: { name, location, imageUrl, id }

/Events/{eventId}/Waitlist/{userId}
    userName, userEmail
    status: "waiting" | "selected" | "confirmed" | "cancelled"
    timestamp
    latitude, longitude (if geolocation enabled)

/facilities/{facilityId}
    name, location, imageUrl

/notifications/{id}
    userId, title, message, timestamp
```

---

## Learning Takeaways

- **Firebase is a backend-as-a-service that removes server management but introduces async complexity.** Every read and write is a callback chain. Forgetting to handle failures, or updating UI from the wrong thread, are the most common bugs. The async model forces explicit callback design (the `FirestoreCallback` and `Callback<T>` interfaces used throughout).
- **The Repository pattern isolates Firebase from business logic.** Controllers call repositories; repositories talk to Firebase and return data through callbacks. This made unit testing the model layer possible without hitting a real database.
- **QR codes as deep links are a practical event discovery mechanism.** Encoding `eventapp://event/{eventId}` means a single scan can route an anonymous user directly to a specific event's signup page — no search required. ZXing generates the bitmap; ML Kit decodes it in real time.
- **Geolocation as opt-in creates a privacy tradeoff.** Organizers can enable geolocation per event. If enabled, the entrant's GPS coordinates at signup time are stored and displayed on a map — useful for seeing where entrants came from but requires explicit permission handling and user consent.
- **Notifications require permission on Android 13+.** `POST_NOTIFICATIONS` became a runtime permission in API 33 (Tiramisu). The `notificationsPerm` flag on each user reflects whether they granted it. The repository checks this before sending, which avoids noise in production.
- **Random shuffle for fairness is trivially correct but operationally tricky.** `Collections.shuffle()` on the in-memory waitlist is correct, but a real deployment would need server-side execution to prevent race conditions if two organizers draw simultaneously.
- **Agile sprints produce real observable differences.** Sprint 1 was environment and login. Sprint 5 had maps, notifications, admin tools, and QR management. Comparing sprint deliverables is a direct measure of what was learned each iteration.
- **The MVC package split helps but doesn't enforce itself.** Nothing stops a Fragment from directly querying Firestore instead of going through a Controller and Repository. Discipline and code review are what actually enforce the pattern.
- **CRC cards are a useful pre-code design tool.** Writing Class-Responsibility-Collaborator cards forces you to identify what each class owns and who it talks to before writing any code — similar to interface design in typed languages.

---

## Skills Learned

- **Android development:** Activity/Fragment lifecycle, `Intent` navigation, `RecyclerView` + adapters, bottom navigation, `ViewPager2`, date/time pickers, permission request flows
- **Firebase Firestore:** document/collection model, `get`, `set`, `update`, `whereEqualTo`, `whereIn`, `FieldPath.documentId()`, snapshot listeners, subcollections
- **Firebase Storage:** image upload via `Uri`, download URL retrieval, integration with Glide
- **Firebase Cloud Messaging:** `MyFirebaseMessagingService`, token registration, local notification channel setup, `NotificationCompat.Builder`
- **CameraX:** `ProcessCameraProvider`, `ImageAnalysis` use case, `ImageProxy` processing, lifecycle binding
- **ML Kit Barcode Scanning:** `BarcodeScanner`, `InputImage.fromMediaImage()`, `BarcodeScannerOptions`
- **QR code generation:** ZXing `BarcodeEncoder`, `BarcodeFormat.QR_CODE`, bitmap display
- **MVC / Repository pattern** in Java Android
- **Agile methodology:** sprint planning, backlog management, retrospectives, GitHub Projects
- **UML class diagrams and CRC card design**
- **JUnit unit testing** for model and controller logic without Android dependencies

## Skills Needed to Go Deeper

- **Server-side lottery execution** (Firebase Cloud Functions) to prevent race conditions and ensure draw integrity
- **Firestore security rules** — the current rules deny all access (`allow read, write: if false`), meaning the app relies entirely on the SDK being on trusted devices; real rules should enforce per-user ownership
- **Real-time listeners** (`addSnapshotListener`) instead of one-shot `.get()` calls so waitlist counts update live without refresh
- **Offline support** — Firestore's offline persistence for entrants with poor connectivity at the event venue
- **Proper deep-link routing** via Android App Links or URI schemes registered in the manifest so `eventapp://` links open the app from external browsers/messages
- **Image upload size limits and compression** before uploading to Storage to reduce bandwidth and storage cost
- **Pagination** for admin browse screens — loading all users/events at once breaks at scale
