import { SearchX } from "lucide-react";

export function CatalogEmptyState() {
  return (
    <div className="catalog-empty">
      <div className="catalog-empty-icon">
        <SearchX className="w-10 h-10" />
      </div>

      <p>Sin resultados</p>
      <small>Prueba con otra palabra o elige una categoría emocional.</small>
    </div>
  );
}


