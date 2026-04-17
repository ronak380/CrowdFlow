# ⚡ CrowdFlow

**High-Performance Crowd Management PWA for Wankhede Stadium**

**Live Demo:** [https://crowdflow-915016433208.europe-west1.run.app](https://crowdflow-915016433208.europe-west1.run.app)

CrowdFlow is a real-time, geo-fenced queue management system designed to eliminate physical lines at sports venues. Built exclusively for the **Prompt Wars Virtual** hackathon, it focuses on extreme efficiency, robust security, and a premium, zero-friction user experience.

---

## 🚀 Key Features

- **📍 Geo-Fenced Check-In**: Actively monitors distance from Wankhede Stadium using the Haversine formula. The check-in unlocks precisely at 300 meters—using **zero external API costs** (no Google Maps API needed).
- **🛤 Shortest Queue First (SQF)**: A mathematically rigorous assignment engine that uses atomic Firebase Admin transactions to balance load across 5 gates in real-time without bottlenecks or race conditions.
- **⏱ Live Dashboard**: Real-time "Now Serving" and "People Ahead" tracking powered by Firestore `onSnapshot` listeners (drastically faster and more cost-effective than HTTP polling).
- **🕰 Automated Missed-Slot Management**: Built-in 10-minute expiry logic prevents ghost queues, automatically clearing missed attendees with one-tap "rejoin" mechanisms.
- **🛡 Admin Control Panel**: A master switchboard for stadium staff to manually advance queues, monitor venue fill rates, and run global diagnostics.
- **🛠 Production Diagnostic Engine**: Fully runtime-injected environment variables allow for live configuration changes directly from Google Cloud Run without rebuilding the Next.js container.

---

## 🛠 Technical Architecture

- **Framework**: Next.js 14 (App Router)
- **Styling**: Pure Vanilla CSS featuring a premium "Glassmorphism" dark stadium theme
- **Database/Auth**: Firebase Firestore & Firebase Authentication (Email + Password)
- **Deployment & DevOps**: Docker container deployed via Google Cloud Build to fully managed Google Cloud Run endpoints.
- **PWA**: Configured with `next-pwa` for offline caching and home-screen installation.

## 🧪 Testing

We built mission-critical automated tests using **Jest** to mathematically verify core mechanics:
- **`__tests__/queue.test.ts`**: Simulates hundreds of incoming users and forcefully evaluates the atomic `assignQueue` transaction to guarantee zero data overlap and shortest-gate routing.
- **`__tests__/geofence.test.ts`**: Asserts extreme boundary coordinates against Wankhede's core location to verify spoofers are rejected and only attendees inside the 300m radius are admitted.

---

## 📜 Alignment with the Prompt Wars Challenge

1. **Crowd Movement**: Balanced, automated gate assignments ensure security scanners operate at maximum throughput.
2. **Reduced Waiting Times**: Giving attendees a Live ETA on their phones significantly reduces the psychological toll of waiting. They only walk to the gate when their number is called.
3. **Efficiency**: Zero-cost Haversine tracking, no-polling database listeners, and Dockerized cloud routing keeps server load trivial even at maximum stadium capacity.
4. **Resiliency**: Built-in `ConfigGuard` and server-side environment variable bridging prevents Dockerized Next.js apps from ever showing a blank crash screen.
