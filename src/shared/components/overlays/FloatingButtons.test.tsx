import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BRAND_CONFIG } from "@/tenant/config/brand";

import { FloatingButtons } from "./FloatingButtons";

describe("FloatingButtons", () => {
  it("presenta Ayuda como asistencia general y mantiene el canal WhatsApp", () => {
    render(<FloatingButtons />);

    const help = screen.getByRole("link", { name: "Ayuda general por WhatsApp" });
    expect(help).toHaveTextContent("Ayuda");
    expect(help).toHaveAttribute("title", "Ayuda general por WhatsApp");
    expect(help).toHaveAttribute("href", `https://wa.me/${BRAND_CONFIG.contact.whatsapp}`);
    expect(help).toHaveAttribute("target", "_blank");
  });
});
