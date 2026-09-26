import { describe, expect, it } from "vitest";

import {
  DEFAULT_PRODUCT_EXPLORER_PREFERENCES,
  PRODUCT_EXPLORER_PREFERENCES_KEY,
  readProductExplorerPreferences,
  writeProductExplorerPreferences,
} from "./ProductExplorer.preferences";

describe("Product Explorer preferences", () => {
  it("persiste y recupera vista, densidad, columnas y sort", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const preferences = {
      ...DEFAULT_PRODUCT_EXPLORER_PREFERENCES,
      viewMode: "table" as const,
      density: "compact" as const,
      visibleColumns: ["id", "title"] as const,
    };
    writeProductExplorerPreferences({ ...preferences, visibleColumns: [...preferences.visibleColumns] }, storage);
    expect(readProductExplorerPreferences(storage)).toMatchObject({ viewMode: "table", density: "compact", visibleColumns: ["id", "title"] });
    expect(values.has(PRODUCT_EXPLORER_PREFERENCES_KEY)).toBe(true);
  });
});
