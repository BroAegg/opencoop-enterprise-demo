import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'NusaCoop ERP & Offline POS Sandbox | OpenCoop Enterprise',
  description: 'Enterprise Cooperative ERP & Offline-First POS Engine with General Ledger and SHU RAT Simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              &copy; {new Date().getFullYear()} NusaCoop Enterprise OS &bull; Built with Next.js, IndexedDB & Tailwind CSS
            </div>
            <div className="text-slate-500">
              Sanitized Open Source Architecture Showcase by Aegner Billik
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
