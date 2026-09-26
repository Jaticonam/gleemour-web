import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, ImageOff } from "lucide-react";

import type { Product } from "@/shared/types/product";

import {
  formatProductField,
  PRODUCT_FIELDS,
  type ProductFieldKey,
  type ProductSortState,
} from "./ProductExplorer.fields";
import type { ProductDensity } from "./ProductExplorer.preferences";
import { getAdminStatusClassName } from "./ProductExplorer.utils";

interface ProductTableProps {
  products: readonly Product[];
  selectedProductIds: ReadonlySet<string>;
  visibleColumns: readonly ProductFieldKey[];
  density: ProductDensity;
  sort: ProductSortState;
  onSortChange: (sort: ProductSortState) => void;
  onToggle: (productId: string) => void;
  onInspect: (product: Product) => void;
}

export function ProductTable({
  products,
  selectedProductIds,
  visibleColumns,
  density,
  sort,
  onSortChange,
  onToggle,
  onInspect,
}: ProductTableProps) {
  const fields = PRODUCT_FIELDS.filter((field) => visibleColumns.includes(field.key));

  const changeSort = (field: ProductFieldKey) => {
    onSortChange({
      field,
      direction: sort.field === field && sort.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className={`gla-product-table-wrap gla-density-${density}`}>
      <table className="gla-product-table">
        <thead>
          <tr>
            <th className="gla-table-select" scope="col"><span className="sr-only">Selección</span></th>
            {fields.map((field) => (
              <th
                key={field.key}
                scope="col"
                className={`gla-table-field-${field.key}`}
                style={{ minWidth: field.width }}
              >
                {field.sortable ? (
                  <button type="button" onClick={() => changeSort(field.key)} aria-label={`Ordenar por ${field.label}`}>
                    {field.label}
                    {sort.field === field.key ? (
                      sort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : <ChevronsUpDown size={13} />}
                  </button>
                ) : field.label}
              </th>
            ))}
            <th scope="col" className="gla-table-action">Ficha</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={selectedProductIds.has(product.id) ? "gla-table-row-selected" : ""}>
              <td className="gla-table-select">
                <input
                  type="checkbox"
                  checked={selectedProductIds.has(product.id)}
                  onChange={() => onToggle(product.id)}
                  aria-label={`Seleccionar ${product.title}`}
                />
              </td>
              {fields.map((field) => (
                <td key={field.key} className={`gla-table-field-${field.key}`}>
                  {field.key === "img" ? (
                    <span className="gla-table-image">
                      <ImageOff size={15} aria-hidden="true" />
                      {product.img ? <img src={product.img} alt="" /> : null}
                    </span>
                  ) : field.key === "status" ? (
                    <span className={`gla-status gla-status-${getAdminStatusClassName(product.status)}`}>
                      {product.status || "Sin estado"}
                    </span>
                  ) : (
                    <span title={formatProductField(product, field)}>{formatProductField(product, field)}</span>
                  )}
                </td>
              ))}
              <td className="gla-table-action">
                <button type="button" onClick={() => onInspect(product)} aria-label={`Ver ficha de ${product.title}`}>
                  <Eye size={15} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
