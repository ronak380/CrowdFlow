import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getFirebaseRuntimeConfig } from '@/lib/runtime-config';
import ConfigGuard from '@/components/ConfigGuard';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CrowdFlow | Smart Stadium Queue Management',
  description:
    'The official crowd management platform for Wankhede Stadium. Real-time queue tracking, native Google Maps geofencing, and AI-powered stadium assistance.',
  keywords: ['crowd management', 'stadium', 'queue', 'Wankhede', 'Mumbai', 'cricket', 'IPL', 'Google Cloud', 'Gemini AI'],
  authors: [{ name: 'CrowdFlow Team' }],
  category: 'Sports Technology',
  classification: 'Public Infrastructure',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CrowdFlow',
  },
  openGraph: {
    title: 'CrowdFlow | Smart Stadium Queue Management',
    description: 'Avoid the lines at Wankhede Stadium. Real-time digital queueing & AI assistance.',
    url: 'https://crowdflow-stadium.web.app',
    siteName: 'CrowdFlow',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540741282475-e3a1717de6cf?q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'CrowdFlow Stadium Interface',
      },
    ],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrowdFlow | Smart Stadium Queue Management',
    description: 'Digital queue tracking for a seamless stadium experience at Wankhede.',
    images: ['https://images.unsplash.com/photo-1540741282475-e3a1717de6cf?q=80&w=1200'],
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
  const firebaseConfig = getFirebaseRuntimeConfig();
  const gaMeasurementId = firebaseConfig.gaMeasurementId;

  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Runtime Configuration Injection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig)};`,
          }}
        />

        {/* Google Analytics & GTM (Official Next.js Third-Party Packages) */}
        {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
        <GoogleTagManager gtmId="GTM-NWX352C6" />
      </head>
      <body className={inter.className}>
        <ConfigGuard>
          {children}
        </ConfigGuard>
      </body>
    </html>
  );
}
