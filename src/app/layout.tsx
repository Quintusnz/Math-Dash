import type { Metadata, Viewport } from 'next';
import { Nunito, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3056D3',
};

export const metadata: Metadata = {
  title: 'Math Dash',
  description: 'Master your math facts in 60 seconds!',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Math Dash',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
          <div id="modal-root" />
          <div id="toast-root" />
        </Providers>
      </body>
    </html>
  );
}
