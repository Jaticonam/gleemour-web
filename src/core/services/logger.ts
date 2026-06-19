export function logInfo(message: string, data?: unknown): void {
  if (import.meta.env.DEV) {
    console.info(`[Gleemour] ${message}`, data ?? "");
  }
}

export function logError(message: string, error?: unknown): void {
  console.error(`[Gleemour] ${message}`, error ?? "");
}

