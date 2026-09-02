import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { ClientLayout } from './ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'BhoomiSetu | National Land Acquisition',
  description: 'Rashtriya BhoomiSetu — Real-Time National Land Acquisition & Management System (RFCTLARR Act 2013)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
