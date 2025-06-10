import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NextDash-B | Modern SaaS Dashboard',
  description: 'A modern, feature-rich SaaS dashboard boilerplate built with Next.js 14',
  keywords: 'dashboard, saas, nextjs, react, typescript, boilerplate',
  authors: [{ name: 'NextDash-B Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}