import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Gift,
  MessageCircle,
  Music2,
  Pencil,
  Sparkles,
} from "lucide-react";

import type { MusicTrack } from "@/domain/music";
import type {
  Addon,
  Product,
} from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";

import "./ExperienceSummary.css";

interface ExperienceSummaryProps {
  product: Product;
  selectedAddons: Addon[];
  selectedMusic: MusicTrack | null;
  dedication: string;
  productPrice: number;
  addonsTotal: number;
  total: number;
  onBack: () => void;
  onEditArrangements: () => void;
  onEditAddons: () => void;
  onEditMusic: () => void;
  onEditDedication: () => void;
  onWhatsApp: () => void;
}

interface EditButtonProps {
  label: string;
  onClick: () => void;
}

function EditButton({
  label,
  onClick,
}: EditButtonProps) {
  return (
    <button
      type="button"
      className="experience-final-summary__edit"
      onClick={onClick}
      aria-label={label}
    >
      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
      Editar
    </button>
  );
}

export function ExperienceSummary({
  product,
  selectedAddons,
  selectedMusic,
  dedication,
  productPrice,
  addonsTotal,
  total,
  onBack,
  onEditArrangements,
  onEditAddons,
  onEditMusic,
  onEditDedication,
  onWhatsApp,
}: ExperienceSummaryProps) {
  const dedicationText =
    dedication.trim() || "Sin dedicatoria.";

  const musicMeta = selectedMusic
    ? [
        selectedMusic.musicType,
        selectedMusic.moodMusical,
        selectedMusic.platform,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <section
      className="experience-final-summary"
      aria-labelledby="experience-final-summary-title"
    >
      <button
        type="button"
        className="experience-final-summary__back"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a dedicatoria
      </button>

      <header className="experience-final-summary__header">
        <span className="experience-final-summary__eyebrow">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Tu experiencia está lista
        </span>

        <h1 id="experience-final-summary-title">
          Revisa tu detalle personalizado
        </h1>

        <p>
          Confirma que cada elección esté correcta antes de consultar
          disponibilidad por WhatsApp.
        </p>
      </header>

      <article className="experience-final-summary__product">
        <div className="experience-final-summary__product-image">
          <img
            src={product.img || "/placeholder.svg"}
            alt={product.title}
          />
        </div>

        <div className="experience-final-summary__product-copy">
          <span>Arreglo principal</span>
          <strong>{product.title}</strong>
          <small>Ref. {product.id}</small>
        </div>

        <strong className="experience-final-summary__product-price">
          S/ {productPrice.toFixed(2)}
        </strong>

        <EditButton
          label="Editar arreglo principal"
          onClick={onEditArrangements}
        />
      </article>

      <div className="experience-final-summary__sections">
        <section className="experience-final-summary__section">
          <header>
            <div>
              <Gift className="w-4 h-4" aria-hidden="true" />

              <span>
                <small>Personalización</small>
                <strong>Complementos</strong>
              </span>
            </div>

            <EditButton
              label="Editar complementos"
              onClick={onEditAddons}
            />
          </header>

          {selectedAddons.length > 0 ? (
            <ul className="experience-final-summary__addons">
              {selectedAddons.map((addon) => (
                <li key={addon.id}>
                  <span>{addon.title}</span>
                  <strong>S/ {addon.price.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="experience-final-summary__empty">
              Sin complementos seleccionados.
            </p>
          )}

          <div className="experience-final-summary__section-total">
            <span>Total complementos</span>
            <strong>S/ {addonsTotal.toFixed(2)}</strong>
          </div>
        </section>

        <section className="experience-final-summary__section">
          <header>
            <div>
              <Music2 className="w-4 h-4" aria-hidden="true" />

              <span>
                <small>Momento musical</small>
                <strong>Música</strong>
              </span>
            </div>

            <EditButton
              label="Editar música"
              onClick={onEditMusic}
            />
          </header>

          {selectedMusic ? (
            <div className="experience-final-summary__music">
              <strong>{selectedMusic.title}</strong>

              {musicMeta ? <small>{musicMeta}</small> : null}

              {selectedMusic.url ? (
                <a
                  href={selectedMusic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escuchar canción
                </a>
              ) : null}
            </div>
          ) : (
            <p className="experience-final-summary__empty">
              Sin canción seleccionada.
            </p>
          )}
        </section>

        <section className="experience-final-summary__section">
          <header>
            <div>
              <FileText className="w-4 h-4" aria-hidden="true" />

              <span>
                <small>Tarjeta incluida</small>
                <strong>Dedicatoria</strong>
              </span>
            </div>

            <EditButton
              label="Editar dedicatoria"
              onClick={onEditDedication}
            />
          </header>

          <p className="experience-final-summary__dedication">
            {dedicationText}
          </p>
        </section>
      </div>

      <section className="experience-final-summary__total">
        <div className="experience-final-summary__total-row">
          <span>Arreglo principal</span>
          <strong>S/ {productPrice.toFixed(2)}</strong>
        </div>

        <div className="experience-final-summary__total-row">
          <span>Complementos</span>
          <strong>S/ {addonsTotal.toFixed(2)}</strong>
        </div>

        <div className="experience-final-summary__grand-total">
          <span>Total estimado</span>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>

        <p>
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          {BRAND_CONFIG.checkout.experience.disclaimer}
        </p>
      </section>

      <div className="experience-final-summary__actions">
        <button
          type="button"
          className="experience-final-summary__whatsapp"
          onClick={onWhatsApp}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          Consultar por WhatsApp
        </button>

        <small>
          WhatsApp se abrirá con todas las elecciones de esta experiencia.
        </small>
      </div>
    </section>
  );
}