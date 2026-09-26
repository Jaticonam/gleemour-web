import { describe, expect, it } from "vitest";

import { createProductSelection } from "./AdminCoreContracts";

describe("AdminCoreContracts", () => {
  it("crea handoffs por productId, estables y sin duplicados", () => {
    const source = ["GLE-001", "GLE-002", "GLE-001", ""];
    const handoff = createProductSelection(source);

    source[0] = "MUTATED";
    expect(handoff).toEqual({ productIds: ["GLE-001", "GLE-002"] });
  });
});
