import "./CatalogTopNav.css";

import type {
  CatalogTopNavProps,
} from "./CatalogTopNav.types";

export function CatalogTopNav({
  topItems,
  bottomItems,
  activeTop = "",
  activeBottom = "",
  topCounts = {},
  bottomCounts = {},
  onTopSelect,
  onBottomSelect,
}: CatalogTopNavProps) {
  return (
    <div className="catalog-top-nav">

      {topItems.length > 0 && (
        <div className="catalog-top-nav-row catalog-top-nav-row-top">
          {topItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`catalog-top-chip ${
                activeTop === item.id ? "active" : ""
              }`}
              onClick={() => onTopSelect?.(item.id)}
            >
              {item.icon && (
                <span className="catalog-top-chip-icon">
                  {item.icon}
                </span>
              )}

              <span>{item.name}</span>

              {topCounts[item.id] !== undefined && (
                <small>{topCounts[item.id]}</small>
              )}
            </button>
          ))}
        </div>
      )}

      {bottomItems.length > 0 && (
        <div className="catalog-top-nav-row catalog-top-nav-row-bottom">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`catalog-bottom-chip ${
                activeBottom === item.id ? "active" : ""
              }`}
              onClick={() => onBottomSelect?.(item.id)}
            >
              {item.icon && (
                <span className="catalog-bottom-chip-icon">
                  {item.icon}
                </span>
              )}

              <span>{item.name}</span>

              {bottomCounts[item.id] !== undefined && (
                <small>
                  ({bottomCounts[item.id]})
                </small>
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
