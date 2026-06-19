/**
 * Crea helpers de caché para catálogos.
 * Se mantiene genérico para reutilizarlo en cualquier marca.
 */
export function createCatalogCache<T>(cacheKey: string, duration: number) {
  function get(): T[] | null {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;

      const entry = JSON.parse(raw) as {
        data: T[];
        timestamp: number;
        source: "sheets";
      };

      if (Date.now() - entry.timestamp > duration) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  function set(data: T[]) {
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          source: "sheets",
        })
      );
    } catch {
      // Ignorar errores de storage.
    }
  }

  function clear() {
    try {
      sessionStorage.removeItem(cacheKey);
    } catch {
      // Ignorar errores de storage.
    }
  }

  return { get, set, clear };
}


