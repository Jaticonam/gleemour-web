import {
  useEffect,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

import {
  getCatalogUrl,
  getExperienceUrl,
} from "@/app/routes/routes";
import { getProductPrice } from "@/domain/product/pricing";
import { buildExperienceWhatsAppUrl } from "@/integrations/whatsapp/experienceWhatsapp";

import { ExperienceAddons } from "../components/ExperienceAddons";
import { ExperienceAppShell } from "../components/ExperienceAppShell";
import { ExperienceArrangements } from "../components/ExperienceArrangements";
import { ExperienceDedication } from "../components/ExperienceDedication";
import { ExperienceMusic } from "../components/ExperienceMusic";
import { ExperienceSummary } from "../components/ExperienceSummary";
import { useExperienceAddons } from "../hooks/useExperienceAddons";
import { useExperienceArrangements } from "../hooks/useExperienceArrangements";
import { useExperienceDedication } from "../hooks/useExperienceDedication";
import { useExperienceEntry } from "../hooks/useExperienceEntry";
import { useExperienceMusic } from "../hooks/useExperienceMusic";
import {
  canOpenExperienceAddons,
  getExperienceTotal,
} from "../utils/addons.utils";

type ExperienceView =
  | "arrangements"
  | "addons"
  | "music"
  | "dedication"
  | "summary";

export default function ExperiencePage() {
  const navigate = useNavigate();

  const [view, setView] =
    useState<ExperienceView>("arrangements");

  const {
    context,
    product: entryProduct,
    loading,
    error,
  } = useExperienceEntry();

  const arrangements = useExperienceArrangements({
    active: true,
    initialProduct: entryProduct,
  });

  const selectedProduct = arrangements.selectedProduct;

  const addons = useExperienceAddons({
    active: view === "addons",
    product: selectedProduct,
  });

  const music = useExperienceMusic({
    active: view === "music",
    product: selectedProduct,
  });

  const dedication = useExperienceDedication({
    active:
      view === "dedication" ||
      view === "summary",
    product: selectedProduct,
  });

  useEffect(() => {
    if (
      view !== "arrangements" &&
      !canOpenExperienceAddons(selectedProduct?.id)
    ) {
      setView("arrangements");
    }
  }, [selectedProduct, view]);

  const productPrice = selectedProduct
    ? getProductPrice(selectedProduct)
    : 0;

  const total = getExperienceTotal(
    productPrice,
    addons.addonsTotal,
  );

  const openAddons = () => {
    if (!canOpenExperienceAddons(selectedProduct?.id)) {
      return;
    }

    setView("addons");
  };

  const openMusic = () => {
    if (!canOpenExperienceAddons(selectedProduct?.id)) {
      return;
    }

    setView("music");
  };

  const openDedication = () => {
    if (!canOpenExperienceAddons(selectedProduct?.id)) {
      return;
    }

    setView("dedication");
  };

  const openSummary = () => {
    if (!selectedProduct) {
      return;
    }

    dedication.confirmDedication();
    setView("summary");
  };

  const handleExperienceWhatsApp = () => {
    if (!selectedProduct) {
      return;
    }

    const url = buildExperienceWhatsAppUrl({
      product: selectedProduct,
      selectedAddons: addons.selectedAddons,
      selectedMusic: music.selectedTrack,
      dedication: dedication.value,
      productPrice,
      addonsTotal: addons.addonsTotal,
      total,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const backToArrangements = () => {
    setView("arrangements");
  };

  const backToAddons = () => {
    setView("addons");
  };

  const backToMusic = () => {
    setView("music");
  };

  const backToDedication = () => {
    setView("dedication");
  };

  const handleShellBack = () => {
    if (view === "summary") {
      backToDedication();
      return;
    }

    if (view === "dedication") {
      backToMusic();
      return;
    }

    if (view === "music") {
      backToAddons();
      return;
    }

    if (view === "addons") {
      backToArrangements();
      return;
    }

    navigate(context.fallbackUrl);
  };

  const summaryDescription = selectedProduct
    ? view === "summary"
      ? "Revisa toda la experiencia antes de consultar disponibilidad."
      : view === "dedication"
        ? "Escribe el mensaje que incluiremos en la tarjeta."
        : view === "music"
          ? "Elige la canción que acompañará este momento."
          : view === "addons"
            ? "Personaliza el arreglo con uno o varios complementos."
            : "Este es el arreglo seleccionado durante tu exploración."
    : "Selecciona una categoría, una intención y luego el arreglo ideal.";

  const summary = (
    <div className="experience-summary-card">
      <span className="experience-summary-card__label">
        Tu selección
      </span>

      <h2>
        {selectedProduct
          ? "Tu detalle"
          : "Elige tu arreglo"}
      </h2>

      <p>{summaryDescription}</p>

      {selectedProduct ? (
        <>
          <div className="experience-summary-card__product">
            <span>Producto principal</span>
            <strong>{selectedProduct.title}</strong>
            <small>Ref. {selectedProduct.id}</small>
          </div>

          <div className="experience-summary-card__addons">
            <span>Complementos</span>

            {addons.selectedAddons.length > 0 ? (
              <ul>
                {addons.selectedAddons.map((addon) => (
                  <li key={addon.id}>
                    <span>{addon.title}</span>

                    <strong>
                      S/ {addon.price.toFixed(2)}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <small>
                Sin complementos seleccionados.
              </small>
            )}
          </div>

          <div className="experience-summary-card__music">
            <span>Música</span>

            {music.selectedTrack ? (
              <>
                <strong>{music.selectedTrack.title}</strong>

                <small>
                  {[
                    music.selectedTrack.musicType,
                    music.selectedTrack.moodMusical,
                    music.selectedTrack.platform,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </>
            ) : (
              <small>Sin canción seleccionada.</small>
            )}
          </div>

          {dedication.visited ? (
            <div className="experience-summary-card__dedication">
              <span>Dedicatoria</span>

              {dedication.hasDedication ? (
                <strong>{dedication.preview}</strong>
              ) : (
                <small>Sin dedicatoria.</small>
              )}

              {dedication.confirmed ? (
                <small className="experience-summary-card__dedication-status">
                  Confirmada
                </small>
              ) : null}
            </div>
          ) : null}

          <div className="experience-summary-card__breakdown">
            <div>
              <span>Arreglo</span>

              <strong>
                S/ {productPrice.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Complementos</span>

              <strong>
                S/ {addons.addonsTotal.toFixed(2)}
              </strong>
            </div>

            <div className="experience-summary-card__total">
              <span>Total estimado</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>
          </div>
        </>
      ) : (
        <div className="experience-summary-card__empty">
          Todavía no has elegido un arreglo.
        </div>
      )}
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
            Explorar otras opciones

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
  } else if (view === "summary" && selectedProduct) {
    workspace = (
      <ExperienceSummary
        product={selectedProduct}
        selectedAddons={addons.selectedAddons}
        selectedMusic={music.selectedTrack}
        dedication={dedication.value}
        productPrice={productPrice}
        addonsTotal={addons.addonsTotal}
        total={total}
        onBack={backToDedication}
        onEditArrangements={backToArrangements}
        onEditAddons={backToAddons}
        onEditMusic={backToMusic}
        onEditDedication={backToDedication}
        onWhatsApp={handleExperienceWhatsApp}
      />
    );
  } else if (view === "dedication" && selectedProduct) {
    workspace = (
      <ExperienceDedication
        product={selectedProduct}
        value={dedication.value}
        confirmed={dedication.confirmed}
        maxLength={dedication.maxLength}
        onChange={dedication.changeDedication}
        onBack={backToMusic}
        onConfirm={openSummary}
      />
    );
  } else if (view === "music" && selectedProduct) {
    workspace = (
      <ExperienceMusic
        product={selectedProduct}
        availableTracks={music.availableTracks}
        selectedMusicId={music.selectedMusicId}
        hasConfiguredMusic={music.hasConfiguredMusic}
        loading={music.loading}
        error={music.error}
        onSelectMusic={music.selectMusic}
        onBack={backToAddons}
        onContinue={openDedication}
        onRetry={music.retry}
      />
    );
  } else if (view === "addons" && selectedProduct) {
    workspace = (
      <ExperienceAddons
        product={selectedProduct}
        availableAddons={addons.availableAddons}
        selectedAddons={addons.selectedAddons}
        hasConfiguredAddons={addons.hasConfiguredAddons}
        loading={addons.loading}
        error={addons.error}
        onToggleAddon={addons.toggleAddon}
        onBack={backToArrangements}
        onContinue={openMusic}
        onRetry={addons.retry}
      />
    );
  } else {
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
        onContinue={openAddons}
        onRetry={arrangements.retry}
      />
    );
  }

  return (
    <ExperienceAppShell
      mode={context.mode}
      onBack={handleShellBack}
      summary={summary}
    >
      {workspace}
    </ExperienceAppShell>
  );
}
