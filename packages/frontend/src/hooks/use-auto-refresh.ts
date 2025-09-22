import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // em milissegundos
  enabled?: boolean;
}

export function useAutoRefresh(
  refreshFn: () => void,
  options: UseAutoRefreshOptions = {}
) {
  const { interval = 5000, enabled = true } = options;
  const [isPaused, setIsPaused] = useState(() => {
    // Restaura o estado do localStorage se estiver no cliente
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('auto-refresh-paused');
      return savedState === 'true';
    }
    return false;
  });
  const [progress, setProgress] = useState(() => {
    // Restaura o progresso do localStorage se estiver no cliente
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('auto-refresh-progress');
      const savedStartTime = localStorage.getItem('auto-refresh-start-time');
      const isPausedState = localStorage.getItem('auto-refresh-paused') === 'true';
      
      if (savedProgress && savedStartTime && !isPausedState) {
        const elapsed = Date.now() - parseInt(savedStartTime);
        const calculatedProgress = Math.min((elapsed / interval) * 100, 100);
        return Math.max(0, calculatedProgress);
      }
    }
    return 0;
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const getInitialStartTime = () => {
    // Restaura o tempo de início do localStorage
    if (typeof window !== 'undefined') {
      const savedStartTime = localStorage.getItem('auto-refresh-start-time');
      if (savedStartTime) {
        return parseInt(savedStartTime);
      }
    }
    return Date.now();
  };
  
  const startTimeRef = useRef<number>(getInitialStartTime());

  const startProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    startTimeRef.current = Date.now();
    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / interval) * 100, 100);
      setProgress(newProgress);
      
      // Salva o progresso no localStorage para persistência
      if (typeof window !== 'undefined' && !isPaused) {
        localStorage.setItem('auto-refresh-progress', newProgress.toString());
        localStorage.setItem('auto-refresh-start-time', startTimeRef.current.toString());
      }
    }, 100);
  }, [interval, isPaused]);

  const stopProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(0);
    
    // Limpa o localStorage quando para o progresso
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auto-refresh-progress');
      localStorage.removeItem('auto-refresh-start-time');
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!isPaused && enabled) {
      startProgress();
      
      intervalRef.current = setInterval(() => {
        refreshFn();
        startProgress(); // Reiniciar o progresso
      }, interval);
    }
  }, [refreshFn, interval, isPaused, enabled, startProgress]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopProgress();
  }, [stopProgress]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const newState = !prev;
      // Salva o estado no localStorage se estiver no cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem('auto-refresh-paused', newState.toString());
      }
      return newState;
    });
  }, []);

  // Iniciar/parar baseado no estado de pause
  useEffect(() => {
    if (isPaused) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [isPaused, startAutoRefresh, stopAutoRefresh]);

  // Limpar intervalos ao desmontar
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    isPaused,
    progress,
    togglePause,
    startAutoRefresh,
    stopAutoRefresh,
  };
}
