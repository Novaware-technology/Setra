"use client"

import { useAuth } from '@/contexts/uth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function SmartRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const { canAccessDashboard, canAccessUsers, canAccessChats } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Prioridade: Dashboard > Users > Chats
      if (canAccessDashboard()) {
        router.replace('/');
      } else if (canAccessUsers()) {
        router.replace('/users');
      } else if (canAccessChats()) {
        router.replace('/chats');
      } else {
        // Se não tem acesso a nenhuma página, redireciona para login
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, canAccessDashboard, canAccessUsers, canAccessChats, router]);

  // Mostra loading enquanto redireciona
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}
