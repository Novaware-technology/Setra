"use client"

import { useAuth } from '@/contexts/uth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AccessDenied() {
  const { user } = useAuth();
  const { canAccessDashboard, canAccessUsers, canAccessChats } = usePermissions();
  const router = useRouter();

  const getAvailablePages = () => {
    const pages = [];
    if (canAccessDashboard()) pages.push({ name: 'Dashboard', url: '/' });
    if (canAccessUsers()) pages.push({ name: 'Team', url: '/users' });
    if (canAccessChats()) pages.push({ name: 'Histórico de Conversas', url: '/chats' });
    return pages;
  };

  const availablePages = getAvailablePages();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Usuário: <span className="font-medium">{user?.email}</span></p>
            <p>Função: <span className="font-medium">{user?.roles?.join(', ') || 'N/A'}</span></p>
          </div>
          
          {availablePages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Páginas disponíveis:</p>
              <div className="space-y-1">
                {availablePages.map((page) => (
                  <Button
                    key={page.url}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(page.url)}
                  >
                    {page.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <Button
            variant="default"
            className="w-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
