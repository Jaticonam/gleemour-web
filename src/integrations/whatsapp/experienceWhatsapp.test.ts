import {
  describe,
  expect,
  it,
} from "vitest";

import type { MusicTrack } from "@/domain/music";
import type {
  Addon,
  Product,
} from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";

import {
  buildExperienceWhatsAppMessage,
  buildExperienceWhatsAppUrl,
  type BuildExperienceWhatsAppMessageParams,
} from "./experienceWhatsapp";

const product: Product = {
  id: "GLE001",
  title: "Ramo Aurora",
  description: "Un detalle especial.",
  category: "para-enamorar",
  categories: ["para-enamorar"],
  subcategories: ["pense-en-ti"],
  price: 120,
  offer_price: null,
  stock: 5,
  img: "/products/gle001.webp",
  priority: 10,
  status: "Publicado",
  badges: [],
  attributes: [],
  addons: [],
  music: [],
};

const teddy: Addon = {
  id: "ADD001",
  title: "Peluche pequeño",
  price: 25,
  img: "/addons/add001.webp",
  category: "peluches",
  status: "Publicado",
  priority: 10,
};

const chocolates: Addon = {
  id: "ADD002",
  title: "Caja de chocolates",
  price: 18,
  img: "/addons/add002.webp",
  category: "chocolates",
  status: "Publicado",
  priority: 9,
};

const track: MusicTrack = {
  id: "MUS001",
  title: "Nuestra canción",
  description: "Una canción romántica.",
  musicType: "Balada",
  moodMusical: "Romántica",
  platform: "Spotify",
  priority: 10,
  status: "Publicado",
  url: "https://open.spotify.com/track/example",
};

function createParams(
  overrides: Partial<BuildExperienceWhatsAppMessageParams> = {},
): BuildExperienceWhatsAppMessageParams {
  return {
    product,
    selectedAddons: [],
    selectedMusic: null,
    dedication: "",
    productPrice: 120,
    addonsTotal: 0,
    total: 120,
    ...overrides,
  };
}

describe("experienceWhatsapp", () => {
  it("construye una consulta sin opciones adicionales", () => {
    const message = buildExperienceWhatsAppMessage(
      createParams(),
    );

    expect(message).toContain("*✨ Experiencia Gleemour*");
    expect(message).toContain("Producto: Ramo Aurora");
    expect(message).toContain("Código: GLE001");
    expect(message).toContain("Precio: S/ 120.00");
    expect(message).toContain("Sin complementos.");
    expect(message).toContain("Sin canción.");
    expect(message).toContain("Sin dedicatoria.");
    expect(message).toContain("*Total estimado: S/ 120.00*");
  });

  it("incluye uno o varios complementos", () => {
    const message = buildExperienceWhatsAppMessage(
      createParams({
        selectedAddons: [teddy, chocolates],
        addonsTotal: 43,
        total: 163,
      }),
    );

    expect(message).toContain(
      "- Peluche pequeño — S/ 25.00",
    );
    expect(message).toContain(
      "- Caja de chocolates — S/ 18.00",
    );
    expect(message).toContain(
      "Total complementos: S/ 43.00",
    );
  });

  it("incluye la música y su enlace", () => {
    const message = buildExperienceWhatsAppMessage(
      createParams({
        selectedMusic: track,
      }),
    );

    expect(message).toContain("Canción: Nuestra canción");
    expect(message).toContain("Plataforma: Spotify");
    expect(message).toContain(
      "Enlace: https://open.spotify.com/track/example",
    );
  });

  it("conserva los saltos de línea de la dedicatoria", () => {
    const message = buildExperienceWhatsAppMessage(
      createParams({
        dedication: "  Gracias por todo.\nTe quiero mucho.  ",
      }),
    );

    expect(message).toContain(
      "Gracias por todo.\nTe quiero mucho.",
    );
  });

  it("normaliza una dedicatoria compuesta solo por espacios", () => {
    const message = buildExperienceWhatsAppMessage(
      createParams({
        dedication: "   \n   ",
      }),
    );

    expect(message).toContain(
      "*Dedicatoria*\nSin dedicatoria.",
    );
  });

  it("formatea todos los importes con dos decimales", () => {
    const message = buildExperienceWhatsAppMessage(
      createParams({
        productPrice: 99.5,
        addonsTotal: 10.4,
        total: 109.9,
      }),
    );

    expect(message).toContain("Precio: S/ 99.50");
    expect(message).toContain(
      "Total complementos: S/ 10.40",
    );
    expect(message).toContain(
      "*Total estimado: S/ 109.90*",
    );
  });

  it("incluye el aviso de confirmación comercial", () => {
    const message = buildExperienceWhatsAppMessage(
      createParams(),
    );

    expect(message).toContain(
      BRAND_CONFIG.checkout.experience.disclaimer,
    );
    expect(message).toContain(
      BRAND_CONFIG.checkout.experience.closing,
    );
  });

  it("usa el número centralizado de WhatsApp", () => {
    const url = buildExperienceWhatsAppUrl(
      createParams(),
    );

    expect(url).toMatch(
      new RegExp(
        `^https://wa\\.me/${BRAND_CONFIG.contact.whatsapp}\\?text=`,
      ),
    );
  });

  it("codifica y recupera íntegramente el mensaje", () => {
    const params = createParams({
      selectedAddons: [teddy],
      selectedMusic: track,
      dedication: "Siempre contigo 💜",
      addonsTotal: 25,
      total: 145,
    });

    const url = buildExperienceWhatsAppUrl(params);
    const decodedMessage = new URL(url).searchParams.get("text");

    expect(decodedMessage).toBe(
      buildExperienceWhatsAppMessage(params),
    );
  });
});