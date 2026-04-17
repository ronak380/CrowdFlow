import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getFirebaseRuntimeConfig } from '@/lib/runtime-config';

export const metadata: Metadata = {
  title: 'CrowdFlow — Smart Stadium Queue Management',
  description:
    'Seamless crowd management for Wankhede Stadium, Mumbai. Real-time queue tracking, geo-fenced check-ins, and instant push notifications.',
  keywords: ['crowd management', 'stadium', 'queue', 'Wankhede', 'Mumbai', 'cricket', 'IPL'],
  authors: [{ name: 'CrowdFlow' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CrowdFlow',
  },
  openGraph: {
    title: 'CrowdFlow — Smart Stadium Queue Management',
    description: 'Skip the chaos at Wankhede Stadium. Real-time queue tracking & geo-fenced check-ins.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#080e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const firebaseConfig = getFirebaseRuntimeConfig();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Runtime Configuration Injection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig)};`,
          }}
        />

        {/* Google Analytics 4 — loaded only when GA ID is configured */}
        {gaMeasurementId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}', {
                    page_path: window.location.pathname,
                    send_page_view: true,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
