import { safeJsonParse } from "@/core/utils/json";

export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  return safeJsonParse<T>(window.localStorage.getItem(key), fallback);
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(key);
}

