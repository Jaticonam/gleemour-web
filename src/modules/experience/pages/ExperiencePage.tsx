import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Flower2,
  Gift,
  Heart,
  MessageSquareText,
  Music2,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";

import {
  getCatalogUrl,
  getExperienceUrl,
} from "@/app/routes/routes";
import { getProductPrice } from "@/domain/product/pricing";

import { ExperienceAppShell } from "../components/ExperienceAppShell";
import { ExperienceArrangements } from "../components/ExperienceArrangements";
import { useExperienceArrangements } from "../hooks/useExperienceArrangements";
import { useExperienceEntry } from "../hooks/useExperienceEntry";
import type { ExperienceSectionId } from "../types/ExperienceEntry.types";

const SECTION_COPY: Record<
  Exclude<ExperienceSectionId, "inicio">,
  {
    title: string;
    description: string;
    icon: typeof Flower2;
  }
> = {
  arreglos: {
    title: "Encuentra el arreglo que mejor expresa lo que sientes",
    description:
      "Aquí aparecerán las categorías existentes, las subcategorías como fichas y los arreglos relacionados desde Google Sheets.",
    icon: Flower2,
  },
  presentacion: {
    title: "Elige cómo quieres presentar tu detalle",
    description:
      "Envolturas, acabados, cintas, bases y estilos formarán parte de esta sección.",
    icon: Sparkles,
  },
  complementos: {
    title: "Agrega detalles que hagan única la experiencia",
    description:
      "Chocolates, peluches, globos y otros complementos se organizarán como un catálogo interno.",
    icon: Gift,
  },
  musica: {
    title: "Elige la canción que acompañará este momento",
    description:
      "La biblioteca musical se organizará por emociones, ocasiones y recomendaciones de Gleemour.",
    icon: Music2,
  },
  mensaje: {
    title: "Convierte tus sentimientos en un mensaje",
    description:
      "Podrás elegir sugerencias, editarlas y previsualizar cómo se verá la dedicatoria.",
    icon: MessageSquareText,
  },
  entrega: {
    title: "Define cómo quieres vivir la sorpresa",
    description:
      "Entrega sorpresa, coordinación, fecha preferida y otros datos se prepararán antes de continuar por WhatsApp.",
    icon: Truck,
  },
  resumen: {
    title: "Revisa tu experiencia Gleemour",
    description:
      "Aquí se consolidarán el arreglo, la presentación, los complementos, la música, el mensaje y la entrega.",
    icon: Heart,
  },
};

export default function ExperiencePage() {
  const navigate = useNavigate();
  const {
    context,
    product: entryProduct,
    loading,
    error,
  } = useExperienceEntry();

  const [activeSection, setActiveSection] =
    useState<ExperienceSectionId>("inicio");

  const arrangements = useExperienceArrangements({
    active: activeSection === "arreglos",
    initialProduct: entryProduct,
  });

  const selectedProduct =
    arrangements.selectedProduct ?? entryProduct;

  useEffect(() => {
    setActiveSection("inicio");
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [context.mode, context.productId, context.source]);

  const productPrice = selectedProduct
    ? getProductPrice(selectedProduct)
    : 0;

  const summary = (
    <div className="experience-summary-card">
      <span className="experience-summary-card__label">
        Mi experiencia
      </span>

      <h2>
        {selectedProduct ? "Tu detalle seleccionado" : "Comienza a diseñarla"}
      </h2>

      <p>
        {selectedProduct
          ? "El producto ya está listo para comenzar su personalización."
          : "Te ayudaremos a elegir antes de personalizar cada detalle."}
      </p>

      {selectedProduct ? (
        <div className="experience-summary-card__product">
          <span>Producto principal</span>
          <strong>{selectedProduct.title}</strong>
          <small>S/ {productPrice.toFixed(2)}</small>
        </div>
      ) : (
        <div className="experience-summary-card__empty">
          Todavía no has seleccionado un arreglo. Comienza indicando
          qué deseas expresar.
        </div>
      )}

      <ul className="experience-summary-card__steps">
        <li>
          <span>Presentación</span>
          <strong>Pendiente</strong>
        </li>
        <li>
          <span>Complementos</span>
          <strong>Pendiente</strong>
        </li>
        <li>
          <span>Música</span>
          <strong>Pendiente</strong>
        </li>
        <li>
          <span>Mensaje</span>
          <strong>Pendiente</strong>
        </li>
        <li>
          <span>Entrega</span>
          <strong>Pendiente</strong>
        </li>
      </ul>
    </div>
  );

  let workspace;

  if (loading) {
    workspace = (
      <section className="experience-workspace-card">
        <span className="experience-workspace-card__eyebrow">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Preparando tu experiencia
        </span>

        <h1>Estamos trayendo tu detalle al estudio</h1>

        <p>
          Un momento mientras cargamos el producto seleccionado.
        </p>
      </section>
    );
  } else if (error && context.mode === "personalization") {
    workspace = (
      <section className="experience-workspace-card">
        <span className="experience-workspace-card__eyebrow">
          <Search className="w-4 h-4" aria-hidden="true" />
          Producto no disponible
        </span>

        <h1>Podemos ayudarte a elegir otro arreglo</h1>

        <p>{error}</p>

        <div className="experience-workspace-card__actions">
          <Link
            to={getExperienceUrl("home")}
            className="experience-primary-action"
          >
            Comenzar desde el inicio
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            to={getCatalogUrl()}
            className="experience-secondary-action"
          >
            Ver catálogo
          </Link>
        </div>
      </section>
    );
  } else if (activeSection === "inicio") {
    workspace = (
      <section className="experience-workspace-card">
        <span className="experience-workspace-card__eyebrow">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          {context.mode === "guided"
            ? "Bienvenido a nuestra florería digital"
            : "Producto seleccionado"}
        </span>

        <h1>
          {selectedProduct
            ? "Ahora transformemos este detalle en una experiencia"
            : "Cuéntanos qué deseas expresar"}
        </h1>

        <p>
          {selectedProduct
            ? "Personaliza la presentación, agrega complementos, elige la música y escribe el mensaje que acompañará este momento."
            : "Recorre Gleemour como si estuvieras en nuestra florería. Te ayudaremos a encontrar el arreglo y los detalles ideales."}
        </p>

        {selectedProduct ? (
          <div className="experience-product-preview">
            <span>Estás personalizando</span>
            <strong>{selectedProduct.title}</strong>
            <small>
              Código {selectedProduct.id} · S/ {productPrice.toFixed(2)}
            </small>
          </div>
        ) : (
          <div className="experience-placeholder-grid">
            <article className="experience-placeholder-card">
              <strong>¿Qué deseas expresar?</strong>
              <span>
                Amor, agradecimiento, celebración, apoyo o perdón.
              </span>
            </article>

            <article className="experience-placeholder-card">
              <strong>¿Para quién es?</strong>
              <span>
                Te guiaremos hacia los arreglos más adecuados.
              </span>
            </article>
          </div>
        )}

        <div className="experience-workspace-card__actions">
          <button
            type="button"
            className="experience-primary-action"
            onClick={() => setActiveSection("arreglos")}
          >
            {selectedProduct
              ? "Continuar personalizando"
              : "Ayúdame a elegir"}

            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <Link
            to={getCatalogUrl()}
            className="experience-secondary-action"
          >
            Explorar catálogo
          </Link>
        </div>
      </section>
    );
  } else if (activeSection === "arreglos") {
    workspace = (
      <ExperienceArrangements
        categories={arrangements.categories}
        visibleSubcategories={
          arrangements.visibleSubcategories
        }
        visibleProducts={arrangements.visibleProducts}
        selectedCategoryId={
          arrangements.selectedCategoryId
        }
        selectedSubcategoryKey={
          arrangements.selectedSubcategoryKey
        }
        selectedProduct={arrangements.selectedProduct}
        loading={arrangements.loading}
        error={arrangements.error}
        onSelectCategory={arrangements.selectCategory}
        onSelectSubcategory={
          arrangements.selectSubcategory
        }
        onSelectProduct={arrangements.selectProduct}
        onRetry={arrangements.retry}
        onContinue={() =>
          setActiveSection("presentacion")
        }
      />
    );
  } else {
    const section = SECTION_COPY[activeSection];
    const Icon = section.icon;

    workspace = (
      <section className="experience-workspace-card">
        <span className="experience-workspace-card__eyebrow">
          <Icon className="w-4 h-4" aria-hidden="true" />
          Experience Studio
        </span>

        <h2>{section.title}</h2>

        <p>{section.description}</p>

        <div className="experience-placeholder-grid">
          <article className="experience-placeholder-card">
            <strong>Próximo incremento</strong>
            <span>
              Esta sección recibirá fichas visuales y datos reales
              progresivamente.
            </span>
          </article>

          <article className="experience-placeholder-card">
            <strong>Tu selección aparecerá aquí</strong>
            <span>
              El resumen se actualizará sin utilizar carrito ni checkout.
            </span>
          </article>
        </div>

        <div className="experience-workspace-card__actions">
          <button
            type="button"
            className="experience-primary-action"
            onClick={() => setActiveSection("inicio")}
          >
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  return (
    <ExperienceAppShell
      mode={context.mode}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onBack={() => navigate(context.fallbackUrl)}
      summary={summary}
    >
      {workspace}
    </ExperienceAppShell>
  );
}