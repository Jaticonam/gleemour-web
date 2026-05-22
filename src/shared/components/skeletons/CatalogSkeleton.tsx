export function CatalogSkeleton() {
  return (
    <div className="catalog-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="product-card">
          <div className="relative aspect-[1/1.2] overflow-hidden rounded-[18px]">
            <div className="catalog-skeleton h-full w-full rounded-[18px]" />

            <div className="absolute left-3 top-3 h-7 w-24 rounded-full catalog-skeleton" />
            <div className="absolute right-3 bottom-3 flex gap-1.5">
              <div className="h-6 w-20 rounded-full catalog-skeleton" />
              <div className="h-6 w-24 rounded-full catalog-skeleton" />
            </div>
          </div>

          <div className="flex flex-col items-center px-1 pt-3 text-center">
            <div className="mb-2 flex gap-2">
              <div className="h-5 w-16 rounded-full catalog-skeleton" />
              <div className="h-5 w-24 rounded-full catalog-skeleton" />
            </div>

            <div className="mb-2 h-6 w-4/5 rounded catalog-skeleton" />
            <div className="mb-1.5 h-4 w-full rounded catalog-skeleton" />
            <div className="mb-3 h-4 w-3/4 rounded catalog-skeleton" />

            <div className="mb-2 h-10 w-36 rounded catalog-skeleton" />

            <div className="mb-3 flex gap-2">
              <div className="h-7 w-24 rounded-full catalog-skeleton" />
              <div className="h-7 w-28 rounded-full catalog-skeleton" />
            </div>

            <div className="flex w-full gap-2">
              <div className="h-11 flex-1 rounded-2xl catalog-skeleton" />
              <div className="h-11 w-28 rounded-2xl catalog-skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
