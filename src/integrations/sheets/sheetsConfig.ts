export const SHEETS_CONFIG = {
  products: {
    docId: "141vkBWAieL-IY5vcxNdmV8qtX64YFda6AYRDTsoACYs",
    gid: "223977403",
  },

  addons: {
    docId: "141vkBWAieL-IY5vcxNdmV8qtX64YFda6AYRDTsoACYs",
    gid: "301214862",
  },

  campaigns: {
    docId: "141vkBWAieL-IY5vcxNdmV8qtX64YFda6AYRDTsoACYs",
    gid: "1364232111",
  },
} as const;

export type SheetKey = keyof typeof SHEETS_CONFIG;
export type SheetSource = (typeof SHEETS_CONFIG)[SheetKey];
