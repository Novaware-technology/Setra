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
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

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
    }, 100);
  }, [interval]);

  const stopProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(0);
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
    setIsPaused(prev => !prev);
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
