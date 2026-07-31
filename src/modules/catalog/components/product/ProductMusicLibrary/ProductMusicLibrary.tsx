import "./ProductMusicLibrary.css";

import type { ProductMusicLibraryProps } from "./ProductMusicLibrary.types";

export function ProductMusicLibrary({
  tracks,
  selectedMusicId,
  loading,
  error,
  onSelectMusic,
}: ProductMusicLibraryProps) {
  return (
    <section
      className="product-music-library"
      aria-labelledby="product-music-library-title"
    >
      <header className="product-music-library__header">
        <span className="product-music-library__eyebrow">
          Music Library
        </span>

        <h2
          id="product-music-library-title"
          className="product-music-library__title"
        >
          Elige la música para este momento
        </h2>

        <p className="product-music-library__description">
          Selecciona una canción para acompañar tu detalle.
        </p>
      </header>

      {loading ? (
        <p
          className="product-music-library__status"
          aria-live="polite"
        >
          Cargando biblioteca musical...
        </p>
      ) : null}

      {!loading && error ? (
        <p
          className="product-music-library__status product-music-library__status--error"
          role="status"
        >
          {error}
        </p>
      ) : null}

      {!loading && !error && tracks.length === 0 ? (
        <p
          className="product-music-library__status"
          role="status"
        >
          No hay canciones disponibles por el momento.
        </p>
      ) : null}

      {!loading && !error && tracks.length > 0 ? (
        <div className="product-music-library__content">
          <button
            type="button"
            className={[
              "product-music-library__none",
              selectedMusicId === ""
                ? "product-music-library__none--selected"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={selectedMusicId === ""}
            onClick={() => onSelectMusic("")}
          >
            Sin canción
          </button>

          <div className="product-music-library__list">
            {tracks.map((track) => {
              const inputId = `music-track-${track.id}`;
              const selected = selectedMusicId === track.id;

              return (
                <article
                  key={track.id}
                  className={[
                    "product-music-library__card",
                    selected
                      ? "product-music-library__card--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <label
                    className="product-music-library__selection"
                    htmlFor={inputId}
                  >
                    <input
                      id={inputId}
                      className="product-music-library__radio"
                      type="radio"
                      name="product-music"
                      value={track.id}
                      checked={selected}
                      onChange={() => onSelectMusic(track.id)}
                    />

                    <span className="product-music-library__indicator" />

                    <span className="product-music-library__information">
                      <strong className="product-music-library__track-title">
                        {track.title}
                      </strong>

                      <span className="product-music-library__metadata">
                        {[track.musicType, track.moodMusical, track.platform]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>

                      {track.description ? (
                        <span className="product-music-library__track-description">
                          {track.description}
                        </span>
                      ) : null}
                    </span>
                  </label>

                  {track.url ? (
                    <a
                      className="product-music-library__link"
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Escuchar en {track.platform || "la plataforma"}
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}