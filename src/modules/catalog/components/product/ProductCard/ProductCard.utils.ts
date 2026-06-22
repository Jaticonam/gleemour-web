import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

export const CAMPAIGN_BADGE_KEYS = [
  "feliz día papa",
  "feliz dia papa",
  "día de la madre",
  "dia de la madre",
  "san valentín",
  "san valentin",
  "flores amarillas",
  "navidad",
];

export const STATE_BADGE_KEYS = [
  "oferta",
  "más vendido",
  "mas vendido",
  "nuevo",
  "premium",
  "especial",
  "edición limitada",
  "edicion limitada",
  "últimas unidades",
  "ultimas unidades",
  "express",
  "temporada",
];

export function normalizeBadge(value: string) {
  return value.trim().toLowerCase();
}

export function pickBadgeByKeys(
  badges: string[],
  keys: string[],
) {
  return badges.find((badge) =>
    keys.includes(normalizeBadge(badge)),
  );
}

export function getStockPresentation(
  productStateType: string,
) {
  switch (productStateType) {
    case "preorder":
      return {
        StockIcon: Clock,
        stockClass:
          "product-card-status product-card-status-preorder",
      };

    case "sold-out":
      return {
        StockIcon: XCircle,
        stockClass:
          "product-card-status product-card-status-danger",
      };

    case "last-units":
      return {
        StockIcon: AlertTriangle,
        stockClass:
          "product-card-status product-card-status-danger",
      };

    case "limited":
      return {
        StockIcon: AlertTriangle,
        stockClass:
          "product-card-status product-card-status-warning",
      };

    case "unavailable":
      return {
        StockIcon: Clock,
        stockClass:
          "product-card-status product-card-status-muted",
      };

    default:
      return {
        StockIcon: CheckCircle,
        stockClass:
          "product-card-status product-card-status-success",
      };
  }
}
