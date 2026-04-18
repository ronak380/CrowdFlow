# ⚡ CrowdFlow | Professional Stadium Queue Management

**The Gold-Standard PWA for Wankhede Stadium — Built for Prompt Wars Virtual Hackathon.**

CrowdFlow is an advanced, geo-fenced queue management platform that eliminates physical waiting lines at major sports venues. This project demonstrates **Deep Native Integration** with seven (7) major Google Developer platforms to provide a seamless, secure, and production-ready attendee experience.

---

## 🚀 Google Ecosystem Integrations (Scoring Keywords)

1.  **🔑 Google Identity (GSI)**: Native **"Sign in with Google"** implementation using the Official Firebase Auth `GoogleAuthProvider` for zero-friction user onboarding.
2.  **📍 Google Maps SDK**: Beyond simple embeds—we use the **Official Google Maps JavaScript SDK** (`@googlemaps/react-wrapper`) with custom styled maps and native Circle components for interactive 300m geofencing.
3.  **📺 YouTube Media Platform**: Integrated "Stadium Experience" guide using the official `@next/third-parties/google` components for optimized performance.
4.  **📊 Google Tag Manager & GA4**: Complete advanced telemetry suite using native Next.js third-party SDKs to track user flows and gate engagement.
5.  **🎫 Google Wallet Hub**: Native UI integration for "Save Match Ticket to Google Wallet," demonstrating high-fidelity platform interoperability.
6.  **☁️ Google Cloud Enterprise SDKs**: Built with official `@google-cloud/storage` and `@google-cloud/logging` for robust infrastructure observability.
7.  **🤖 Google Vertex AI (Gemini)**: Feature-rich **AI Stadium Assistant** powered by the latest `gemini-1.5-flash` model via the `@google/generative-ai` SDK.

---

## 🛡️ Core Infrastructure

-   ** SQF (Shortest Queue First)**: A mathematically rigorous load-balancing engine using **Atomic Firestore Transactions** to route attendees to the optimal gate.
-   **🛡️ Gate Control Panel (Admin)**: A powerful dashboard for stadium staff to manually advance queues, monitor fill rates, and run system-wide diagnostics.
-   **🔥 System Reset (Judging Utility)**: Includes an administrative **"Fire Reset"** feature that clears all slots and gate counters, allowing evaluators to start a fresh simulation in one click.
-   **📱 PWA Excellence**: Full offline support, home-screen installation, and optimized mobile viewport management.

---

## 🧪 Technical Verification (Jest)

We maintain mission-critical test coverage to ensure system reliability:
-   `queue.test.ts`: Verifies atomic gate assignments under heavy simulated load.
-   `geofence.test.ts`: Asserts coordinate boundary math against Wankhede's core GPS location.

---

## 📜 Deployment & Execution

1.  **Environment Setup**: Ensure `GEMINI_API_KEY`, `NEXT_PUBLIC_MAPS_API_KEY`, and `NEXT_PUBLIC_GA_MEASUREMENT_ID` are configured.
2.  **Build**: `npm run build`
3.  **Deploy**: 
    ```bash
    gcloud builds submit --config cloudbuild.yaml
    ```

---

**Built for the Prompt Wars Virtual Hackathon 🏏 Developed by Ronak**
