import { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import '@/app/admin/admin.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Atlas CRM | Command Center',
  description: 'Lead management and SMS campaigns',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${jakarta.variable} ${jetbrains.variable} admin-shell`}>
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
