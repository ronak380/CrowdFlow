# ⚡ CrowdFlow

**High-Performance Crowd Management PWA for Wankhede Stadium**

CrowdFlow is a real-time, geo-fenced queue management system designed to eliminate physical lines at sports venues. Built for the **Prompt Wars Virtual** hackathon, it focuses on efficiency, security, and premium user experience.

## 🚀 Key Features

-   **Geo-Fenced Check-In**: Automatic check-in activation using Haversine formula when within 300m of Wankhede Stadium. **Zero external API costs** (no Google Maps API needed).
-   **Shortest Queue First (SQF)**: Atomic assignment engine that balances load across 5 gates in real-time.
-   **Live Dashboard**: Real-time "Now Serving" updates using Firestore `onSnapshot` (no polling).
-   **Automated Missed-Slot Management**: 10-minute expiry logic with easy rejoin options to keep the crowd moving.
-   **Push Notifications**: FCM integration for turn alerts ("Your turn is near!" and "Proceed to gate!").
-   **Admin Control Panel**: Advanced gate management for stadium staff to advance numbers and monitor venue fill rates.

## 🛠 Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Vanilla CSS (Glassmorphism, Dark Stadium Theme)
-   **Database**: Firebase Firestore
-   **Auth**: Firebase Authentication (Email + Google SSO)
-   **Notifications**: Firebase Cloud Messaging (FCM)
-   **Deployment**: Google Cloud Run + Cloud Build
-   **PWA**: `next-pwa` for offline support and home screen installation.

## 📋 Environment Setup

1.  Copy `.env.local.example` to `.env.local`.
2.  Fill in your Firebase config (Client keys and Admin SDK Service Account).
3.  Set a `CRON_SECRET` for securing the missed-slot API.

## 🏗 Deployment to Google Cloud

The project includes a production-ready `Dockerfile` and `cloudbuild.yaml`.

```bash
# To deploy manually using Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

## 🧪 Testing

```bash
# Run unit tests
npm test
```

## 📜 Problem Statement Alignment

-   **Crowd Movement**: Balanced gate assignments prevent bottlenecks.
-   **Waiting Times**: Real-time ETA and "Ahead of you" count reduce perceived wait time.
-   **Efficiency**: Minimized API calls and atomic transactions ensure scalability.
-   **Security**: Server-side geo-validation and strict Firestore rules.
-   **Accessibility**: High-contrast dark theme, ARIA labels, and PWA offline support.
