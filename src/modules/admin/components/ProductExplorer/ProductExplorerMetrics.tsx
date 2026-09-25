import { Archive, Boxes, PackageCheck, PackageX } from "lucide-react";

import type { ProductExplorerStats, ProductQuickFilter } from "./ProductExplorer.utils";

interface ProductExplorerMetricsProps {
  stats: ProductExplorerStats;
  status: string;
  quickFilter: ProductQuickFilter;
  onShowAll: () => void;
  onShowPublished: () => void;
  onQuickFilterChange: (filter: ProductQuickFilter) => void;
}

export function ProductExplorerMetrics({
  stats,
  status,
  quickFilter,
  onShowAll,
  onShowPublished,
  onQuickFilterChange,
}: ProductExplorerMetricsProps) {
  const metrics = [
    {
      label: "Total",
      value: stats.total,
      icon: Boxes,
      modifier: "total",
      active: status === "all" && quickFilter === "all",
      onClick: onShowAll,
    },
    {
      label: "Publicados",
      value: stats.published,
      icon: PackageCheck,
      modifier: "published",
      active: status === "Publicado" && quickFilter === "all",
      onClick: onShowPublished,
    },
    {
      label: "En preparación",
      value: stats.preparation,
      icon: Archive,
      modifier: "preparation",
      active: quickFilter === "preparation",
      onClick: () => onQuickFilterChange("preparation"),
    },
    {
      label: "Sin stock",
      value: stats.withoutStock,
      icon: PackageX,
      modifier: "stock",
      active: quickFilter === "without-stock",
      onClick: () => onQuickFilterChange("without-stock"),
    },
  ];

  return (
    <div className="gla-metrics" aria-label="Filtros rápidos de productos">
      {metrics.map(({ label, value, icon: Icon, modifier, active, onClick }) => (
        <button
          key={label}
          type="button"
          className={active ? "gla-metric-active" : ""}
          aria-pressed={active}
          onClick={onClick}
        >
          <span className={`gla-metric-icon gla-metric-icon-${modifier}`}>
            <Icon size={18} aria-hidden="true" />
          </span>
          <span>
            <span>{label}</span>
            <strong>{value}</strong>
          </span>
        </button>
      ))}
    </div>
  );
}
