import { Space_Grotesk, Manrope } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Fulvora Digital — AI-Powered Performance Marketing in Pune & PCMC',
  description:
    'Fulvora Digital designs and runs Meta + Google Ads that bring real phone calls, WhatsApp messages, qualified leads, and store visits for local businesses in Pune and PCMC.',
  keywords: [
    'performance marketing Pune',
    'Meta Ads PCMC',
    'Google Ads Pune',
    'digital marketing agency Pune',
    'Fulvora Digital',
  ],
  openGraph: {
    title: 'Fulvora Digital — We Grow Your Brand. You Grow Your Business.',
    description:
      'AI-powered performance marketing for local businesses in Pune and PCMC.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body className="font-body antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
