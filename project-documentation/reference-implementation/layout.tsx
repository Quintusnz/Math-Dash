import type { Metadata } from 'next';
import { Nunito, Inter } from 'next/font/google';
import './global.css';
import { Providers } from './providers'; // Client Component wrapper for QueryClientProvider

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

export const metadata: Metadata = {
  title: 'Math Dash',
  description: 'Master your math facts in 60 seconds!',
  manifest: '/manifest.json',
  themeColor: '#3056D3',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // Prevent zooming on game controls
    userScalable: false,
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
