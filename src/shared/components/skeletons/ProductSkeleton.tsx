export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-3 py-6 md:px-4 md:py-8">
      <div className="space-y-5">
        <div className="rounded-[24px] border border-border bg-card p-3 md:p-4">
          <div className="catalog-skeleton aspect-square rounded-[18px]" />
        </div>

        <div className="space-y-4 rounded-[24px] border border-border bg-card p-4">
          <div className="catalog-skeleton h-4 w-24 rounded-full" />
          <div className="catalog-skeleton h-8 w-4/5 rounded-xl" />

          <div className="space-y-2">
            <div className="catalog-skeleton h-4 w-full rounded" />
            <div className="catalog-skeleton h-4 w-5/6 rounded" />
          </div>

          <div className="space-y-2 pt-2">
            <div className="catalog-skeleton h-6 w-32 rounded" />
            <div className="catalog-skeleton h-10 w-40 rounded-xl" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <div className="catalog-skeleton h-8 w-24 rounded-full" />
            <div className="catalog-skeleton h-8 w-28 rounded-full" />
            <div className="catalog-skeleton h-8 w-24 rounded-full" />
          </div>

          <div className="space-y-3 pt-4">
            <div className="catalog-skeleton h-11 w-full rounded-xl" />
            <div className="catalog-skeleton h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
