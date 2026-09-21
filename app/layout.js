import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://fulvoradigital.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fulvora Digital — AI-Powered Performance Marketing in Pune & PCMC',
    template: '%s | Fulvora Digital',
  },
  description:
    'Fulvora Digital designs and runs Meta + Google Ads that bring real phone calls, WhatsApp messages, qualified leads and store visits for local businesses across Pune and PCMC.',
  keywords: [
    'performance marketing Pune', 'digital marketing agency PCMC', 'Meta Ads Pune',
    'Google Ads Pune', 'AI marketing Pune', 'WhatsApp lead generation', 'Fulvora Digital',
    'local marketing Wakad', 'digital marketing Hinjewadi', 'Baner ads agency',
  ],
  authors: [{ name: 'Fulvora Digital' }],
  creator: 'Fulvora Digital',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Fulvora Digital',
    title: 'Fulvora Digital — We Grow Your Brand. You Grow Your Business.',
    description: 'AI-powered performance marketing for local businesses in Pune and PCMC.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fulvora Digital — AI-Powered Performance Marketing',
    description: 'Meta + Google Ads that bring real leads for local businesses in Pune & PCMC.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: '/fulvora-logo.png',
    shortcut: '/fulvora-logo.png',
    apple: '/fulvora-logo.png',
  },
};

export const viewport = {
  themeColor: '#6D28D9',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Fulvora Digital',
  description:
    'AI-powered performance marketing agency serving local businesses in Pune and PCMC.',
  url: SITE_URL,
  telephone: '+91-72182-00921',
  email: 'fulvoradigital@gmail.com',
  areaServed: [
    { '@type': 'City', name: 'Pune' },
    { '@type': 'City', name: 'Pimpri-Chinchwad' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Pune',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
  priceRange: '₹18,000 – ₹45,000 / month',
  sameAs: [
    'https://instagram.com/fulvoradigital',
    'https://www.linkedin.com/company/fulvoradigital',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/fulvora-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/fulvora-logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
