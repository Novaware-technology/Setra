"use client"

import { useAuth } from '@/contexts/uth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallbackUrl?: string;
}

export function RouteGuard({ 
  children, 
  requiredRoles = [], 
  fallbackUrl 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyRole, canAccessDashboard, canAccessUsers, canAccessChats } = usePermissions();
  const router = useRouter();

  // Determina a URL de fallback baseada nas permissões do usuário
  const getFallbackUrl = () => {
    if (fallbackUrl) return fallbackUrl;
    
    // Prioridade: Dashboard > Users > Chats
    if (canAccessDashboard()) return '/';
    if (canAccessUsers()) return '/users';
    if (canAccessChats()) return '/chats';
    
    return '/chats'; // Fallback padrão
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        router.push(getFallbackUrl());
      }
    }
  }, [isAuthenticated, isLoading, requiredRoles, hasAnyRole, router, fallbackUrl]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderiza nada (o layout já redireciona)
  if (!isAuthenticated) {
    return null;
  }

  // Se tem roles requeridas e não tem permissão, não renderiza nada (já redirecionou)
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}
