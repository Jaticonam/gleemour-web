import { useEffect, useMemo, useState } from "react";

import { resolveProductAddons } from "@/domain/product/addons";
import { loadAllAddons } from "@/integrations/sheets/fetchSheets";
import type { Addon } from "@/shared/types/product";

export function useProductAddonOptions(
  addonIds: readonly string[] = [],
): Addon[] {
  const [addonCatalog, setAddonCatalog] = useState<Addon[]>([]);

  useEffect(() => {
    let active = true;

    loadAllAddons()
      .then((addons) => {
        if (active) {
          setAddonCatalog(addons);
        }
      })
      .catch(() => {
        if (active) {
          setAddonCatalog([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(
    () => resolveProductAddons(addonIds, addonCatalog),
    [addonIds, addonCatalog],
  );
}
