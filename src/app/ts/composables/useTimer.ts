import { useState, useEffect } from 'react';

export const useTimer = (intervalMs: number = 1000) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.safeTimers.setInterval(() => {
      setTick(x => x + 1);
    }, intervalMs);

    return () => window.safeTimers.clearInterval(id);
  }, [intervalMs]);

  return tick;
};
