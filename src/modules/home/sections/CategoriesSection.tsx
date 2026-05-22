import { Link } from "react-router-dom";
import { ArrowRight, Building2, Flower2, Music, Sparkles } from "lucide-react";

import HomeSectionHeader from "../components/HomeSectionHeader";

const categories = [
  {
    name: "Naturales",
    tag: "Flores frescas",
    slug: "naturales",
    description:
      "Arreglos vivos, delicados y llenos de emoción para sorprender en el momento perfecto.",
    feature: "Más pedido",
    icon: Flower2,
    tone: "primary",
    gridClass: "lg:col-span-2",
    isLarge: true,
  },
  {
    name: "Artificiales",
    tag: "Belleza duradera",
    slug: "artificiales",
    description:
      "Detalles que permanecen en el tiempo y convierten un recuerdo en algo visible.",
    feature: "Duradero",
    icon: Sparkles,
    tone: "secondary",
    gridClass: "lg:col-span-1",
    isLarge: false,
  },
  {
    name: "Corporativos",
    tag: "Para empresas",
    slug: "corporativos",
    description:
      "Detalles elegantes para clientes, equipos, eventos y fechas especiales.",
    feature: "Empresas",
    icon: Building2,
    tone: "lavender",
    gridClass: "lg:col-span-1",
    isLarge: false,
  },
];

export default function CategoriesSection() {
  return (
    <section id="catalogo" className="home-section categories-section">
      <HomeSectionHeader
        icon={Music}
        kicker="Categorías Gleemour"
        title="Elige cómo quieres hacer sentir"
        description="Naturales, artificiales o corporativos: encuentra el detalle ideal para cada intención."
        align="center"
      />

      <div className="categories-divider" />

      <div className="categories-premium-grid">
        {categories.map((cat, index) => {
          const Icon = cat.icon;

          return (
            <Link
              key={cat.slug}
              to={`/catalogo/categoria.html?cat=${cat.slug}`}
              className={`categories-premium-card ${cat.gridClass} tone-${cat.tone}`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="categories-feature-badge">{cat.feature}</span>

              <div
                className={`categories-premium-content ${
                  cat.isLarge ? "is-large" : ""
                }`}
              >
                <div className="categories-icon-box">
                  <Icon size={cat.isLarge ? 42 : 36} strokeWidth={1.6} />
                </div>

                <div className="categories-copy">
                  <span className="categories-tag">{cat.tag}</span>

                  <h3>{cat.name}</h3>

                  <p>{cat.description}</p>

                  <div className="categories-card-cta">
                    <span>Ver detalles</span>
                    <span className="categories-line" />
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>

              <div className="categories-glow" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
