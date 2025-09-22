import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface PageInfo {
  title: string;
  path: string;
}

const pageMap: Record<string, PageInfo> = {
  '/': {
    title: 'Dashboard',
    path: '/'
  },
  '/users': {
    title: 'Team',
    path: '/users'
  },
  '/chats': {
    title: 'Histórico de Conversas',
    path: '/chats'
  }
};

export function useCurrentPage() {
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    // Remove query parameters from pathname
    const cleanPath = pathname.split('?')[0];
    
    return pageMap[cleanPath] || {
      title: 'Página',
      path: cleanPath
    };
  }, [pathname]);

  return {
    currentPage,
    isCurrentPath: (path: string) => {
      const cleanPath = pathname.split('?')[0];
      return cleanPath === path;
    }
  };
}
