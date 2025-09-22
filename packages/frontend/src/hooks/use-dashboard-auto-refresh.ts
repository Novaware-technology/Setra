import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAutoRefresh } from './use-auto-refresh';

export function useDashboardAutoRefresh() {
  const queryClient = useQueryClient();

  const refreshAllDashboardData = useCallback(() => {
    // Invalidar todas as queries do dashboard para forçar refetch
    queryClient.invalidateQueries({
      queryKey: ['dashboard-metrics']
    });
    queryClient.invalidateQueries({
      queryKey: ['dashboard-timeseries']
    });
    queryClient.invalidateQueries({
      queryKey: ['dashboard-conversations']
    });
  }, [queryClient]);

  const { isPaused, progress, togglePause } = useAutoRefresh(refreshAllDashboardData, {
    interval: 5000, // 5 segundos
    enabled: true,
  });

  return {
    isPaused,
    progress,
    togglePause,
  };
}
