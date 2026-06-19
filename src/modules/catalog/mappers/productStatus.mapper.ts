import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface ProductStateLike {
  type: string;
}

export function getProductStatusPresentation(productState: ProductStateLike) {
  switch (productState.type) {
    case "available":
      return {
        className: "product-detail-status-success",
        Icon: CheckCircle,
      };

    case "preorder":
      return {
        className: "product-detail-status-preorder",
        Icon: Clock,
      };

    case "sold-out":
      return {
        className: "product-detail-status-danger",
        Icon: XCircle,
      };

    case "last-units":
    case "limited":
      return {
        className: "product-detail-status-warning",
        Icon: AlertTriangle,
      };

    default:
      return {
        className: "product-detail-status-muted",
        Icon: Clock,
      };
  }
}
