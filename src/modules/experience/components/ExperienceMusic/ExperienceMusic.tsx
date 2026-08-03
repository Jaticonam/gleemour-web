import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Headphones,
  Music2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import type { MusicTrack } from "@/domain/music";
import type { Product } from "@/shared/types/product";

import { normalizeExperienceMusicId } from "../../utils/music.utils";

import "./ExperienceMusic.css";

interface ExperienceMusicProps {
  product: Product;
  availableTracks: MusicTrack[];
  selectedMusicId: string;
  hasConfiguredMusic: boolean;
  loading: boolean;
  error: string | null;
  onSelectMusic: (musicId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onRetry: () => void;
}

export function ExperienceMusic({
  product,
  availableTracks,
  selectedMusicId,
  hasConfiguredMusic,
  loading,
  error,
  onSelectMusic,
  onBack,
  onContinue,
  onRetry,
}: ExperienceMusicProps) {
  const normalizedSelectedMusicId =
    normalizeExperienceMusicId(selectedMusicId);

  return (
    <section
      className="experience-music"
      aria-labelledby="experience-music-title"
    >
      <button
        type="button"
        className="experience-music__back"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a complementos
      </button>

      <header className="experience-music__header">
        <span className="experience-music__eyebrow">
          <Music2 className="w-4 h-4" aria-hidden="true" />
          La música guía cada emoción
        </span>

        <h1 id="experience-music-title">
          Elige la canción de este momento
        </h1>

        <p>
          Selecciona una canción para acompañar tu detalle o continúa
          sin música. Esta elección no modifica el precio.
        </p>
      </header>

      <article className="experience-music__product">
        <div className="experience-music__product-image">
          <img
            src={product.img || "/placeholder.svg"}
            alt={product.title}
          />
        </div>

        <div className="experience-music__product-copy">
          <span>Arreglo principal</span>
          <strong>{product.title}</strong>
          <small>Ref. {product.id}</small>
        </div>

        <div className="experience-music__product-status">
          <Headphones className="w-5 h-5" aria-hidden="true" />
          <span>
            {normalizedSelectedMusicId
              ? "Canción elegida"
              : "Sin canción"}
          </span>
        </div>
      </article>

      {loading ? (
        <div
          className="experience-music__state"
          aria-live="polite"
        >
          <Sparkles className="w-6 h-6" aria-hidden="true" />

          <strong>Preparando la selección musical</strong>

          <span>
            Estamos consultando las canciones disponibles para este
            arreglo.
          </span>
        </div>
      ) : error ? (
        <div
          className="experience-music__state experience-music__state--error"
          role="alert"
        >
          <strong>No pudimos cargar la biblioteca musical</strong>

          <span>{error}</span>

          <button type="button" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Intentar nuevamente
          </button>
        </div>
      ) : !hasConfiguredMusic ? (
        <div
          className="experience-music__state"
          aria-live="polite"
        >
          <Music2 className="w-6 h-6" aria-hidden="true" />

          <strong>
            Este arreglo no tiene canciones configuradas
          </strong>

          <span>
            Puedes conservar el arreglo sin música y continuar con tu
            dedicatoria.
          </span>
        </div>
      ) : availableTracks.length === 0 ? (
        <div
          className="experience-music__state"
          aria-live="polite"
        >
          <Music2 className="w-6 h-6" aria-hidden="true" />

          <strong>
            No hay canciones publicadas para este arreglo
          </strong>

          <span>
            Las referencias configuradas no están disponibles
            actualmente. Puedes continuar sin música.
          </span>
        </div>
      ) : (
        <section
          className="experience-music__options"
          aria-labelledby="experience-music-options-title"
        >
          <div className="experience-music__section-heading">
            <div>
              <span>Biblioteca musical</span>

              <h2 id="experience-music-options-title">
                Elige una sola canción
              </h2>
            </div>

            <small>
              {availableTracks.length}{" "}
              {availableTracks.length === 1
                ? "opción"
                : "opciones"}
            </small>
          </div>

          <button
            type="button"
            className={[
              "experience-music__none",
              normalizedSelectedMusicId === ""
                ? "experience-music__none--selected"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelectMusic("")}
            aria-pressed={normalizedSelectedMusicId === ""}
          >
            <span className="experience-music__none-icon">
              {normalizedSelectedMusicId === "" ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Music2 className="w-4 h-4" aria-hidden="true" />
              )}
            </span>

            <span>
              <strong>Continuar sin canción</strong>
              <small>
                Puedes decidir la música más adelante.
              </small>
            </span>
          </button>

          <div
            className="experience-music__grid"
            role="radiogroup"
            aria-label="Canciones disponibles para el arreglo"
          >
            {availableTracks.map((track) => {
              const normalizedTrackId =
                normalizeExperienceMusicId(track.id);

              const selected =
                normalizedTrackId ===
                normalizedSelectedMusicId;

              const metadata = [
                track.musicType,
                track.moodMusical,
                track.platform,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <article
                  key={track.id}
                  className={[
                    "experience-music-card",
                    selected
                      ? "experience-music-card--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    className="experience-music-card__selection"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onSelectMusic(track.id)}
                  >
                    <span className="experience-music-card__indicator">
                      {selected ? (
                        <Check
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                      ) : (
                        <Music2
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                      )}
                    </span>

                    <span className="experience-music-card__content">
                      <span>Canción</span>
                      <strong>{track.title}</strong>

                      {metadata && <small>{metadata}</small>}

                      {track.description && (
                        <p>{track.description}</p>
                      )}
                    </span>
                  </button>

                  {track.url && (
                    <a
                      className="experience-music-card__link"
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Escuchar en {track.platform || "la plataforma"}

                      <ExternalLink
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="experience-music__continue">
        <small>
          Puedes avanzar con una canción elegida o sin música.
        </small>

        <button
          type="button"
          onClick={onContinue}
        >
          Continuar a dedicatoria

          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
