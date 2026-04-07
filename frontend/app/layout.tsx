import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research Paper Visualizer',
  description: 'Conference demo: PDF to motion graphics video',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
