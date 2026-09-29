export function CatalogSkeleton() {
  return (
    <div className="catalog-page" aria-busy="true" aria-label="Cargando productos">
      <main className="catalog-main">
        <div className="catalog-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card" aria-hidden="true">
              <div className="product-card-image-wrap catalog-skeleton" />
              <div className="product-card-body">
                <div className="h-4 w-4/5 rounded catalog-skeleton" />
                <div className="mt-2 h-4 w-3/5 rounded catalog-skeleton" />
                <div className="mt-3 h-6 w-2/3 rounded catalog-skeleton" />
                <div className="product-card-actions">
                  <div className="product-card-button-personalize catalog-skeleton" />
                  <div className="product-card-button-wa catalog-skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


