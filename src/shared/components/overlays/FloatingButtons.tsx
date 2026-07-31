import { MessageCircle, Package } from "lucide-react";

import { BRAND_CONFIG } from "@/tenant/config/brand";

interface FloatingButtonsProps {
  variant?: "shop" | "home";
}

export function FloatingButtons({
  variant = "shop",
}: FloatingButtonsProps) {
  const isHome = variant === "home";

  return (
    <div className="floating-buttons-wrap">
      {isHome ? (
        <a
          href="/catalogo"
          className="floating-btn floating-btn-catalog"
        >
          <Package className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">
            {BRAND_CONFIG.floating.catalogLabel}
          </span>
        </a>
      ) : null}

      <a
        href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn floating-btn-whatsapp"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">
          {BRAND_CONFIG.floating.whatsappLabel}
        </span>
      </a>
    </div>
  );
}