// src/app/(dashboard)/layout.tsx
'use client';

import { useAuth } from '@/contexts/uth-context';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/features/dashboard/app-sidebar';
import { SiteHeader } from '@/components/features/dashboard/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Carregando...</div>;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}