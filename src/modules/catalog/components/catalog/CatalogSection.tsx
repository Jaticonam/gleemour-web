import type { ReactNode } from "react";

interface CatalogSectionProps {
  title: string;
  text: string;
  children: ReactNode;
}

export function CatalogSection({
  title,
  text,
  children,
}: CatalogSectionProps) {
  return (
    <section className="catalog-section">
      <div className="catalog-section-header">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

      {children}
    </section>
  );
}


