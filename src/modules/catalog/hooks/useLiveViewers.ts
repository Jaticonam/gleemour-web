import { useEffect, useState } from "react";

interface UseLiveViewersOptions {
  min?: number;
  max?: number;
  interval?: number;
}

export function useLiveViewers({
  min = 3,
  max = 18,
  interval = 12000,
}: UseLiveViewersOptions = {}) {
  const getRandomViewers = () =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const [viewers, setViewers] = useState(getRandomViewers);

  useEffect(() => {
    const id = window.setInterval(() => {
      setViewers(getRandomViewers());
    }, interval);

    return () => window.clearInterval(id);
  }, [min, max, interval]);

  return viewers;
}
