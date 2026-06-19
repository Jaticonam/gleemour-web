import { useCallback } from "react";

import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";
import { showNotification } from "@/shared/components/feedback/NotificationStack";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";
import type { Product } from "@/shared/types/product";

interface UseProductActionsOptions {
  product?: Product;
  qty: number;
}

export function useProductActions({
  product,
  qty,
}: UseProductActionsOptions) {
  const handleShare = useCallback(() => {
    if (!product) return;

    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
      return;
    }

    navigator.clipboard.writeText(window.location.href);
    showNotification(
      PRODUCT_DETAIL_CONFIG.notifications.linkCopiedTitle,
      PRODUCT_DETAIL_CONFIG.notifications.linkCopiedDescription,
    );
  }, [product]);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;

    const url = buildProductWhatsAppUrl({
      product,
      qty,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  }, [product, qty]);

  return {
    handleShare,
    handleWhatsApp,
  };
}
