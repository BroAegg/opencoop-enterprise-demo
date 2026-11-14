import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Manasuka Coop (Enterprise Demo) | Automated ERP & Offline POS',
  description: 'Enterprise Cooperative ERP & Offline-First POS Engine with General Ledger and SHU RAT Simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="antialiased min-h-screen bg-[#F4F5F7] text-slate-900 font-sans selection:bg-[#1F6376]/20 selection:text-[#1F6376]">
        {children}
      </body>
    </html>
  );
}
