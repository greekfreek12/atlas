import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plumber Sites',
  description: 'Professional plumbing services websites',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
