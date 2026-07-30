import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-client-provider';

export const metadata: Metadata = {
  title: 'Baby Tracker | Log & Track Baby Activities',
  description:
    "Track and analyze your baby's activities: feeding, diaper changes, sleeping patterns and more, all from a beautiful timeline view.",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-neutral-200">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
