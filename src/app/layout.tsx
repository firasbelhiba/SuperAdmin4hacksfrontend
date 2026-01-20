import { Outfit } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: '4Hacks Admin Dashboard',
  description: 'Admin dashboard for managing hackathons, users, and organizations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
