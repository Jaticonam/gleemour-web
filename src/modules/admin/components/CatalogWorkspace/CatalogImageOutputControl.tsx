import "./CatalogImageOutputControl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";

import { createCatalogCommercialComposition } from "@/application/admin/AdminCommercialComposition";
import {
  createCatalogVersionSnapshot,
  toCatalogDraftContract,
  type CatalogCompositionDraft,
  type CatalogCompositionResult,
} from "@/application/admin/CatalogComposition";
import {
  GLEEMOUR_CATALOG_IMAGE_PRESET,
  type CatalogImageArtifact,
  type CatalogImageRenderer,
} from "@/application/admin/CatalogImageOutput";
import { CanvasCatalogImageRenderer } from "@/integrations/browser/CanvasCatalogImageRenderer";

interface CatalogImageOutputControlProps {
  draft: CatalogCompositionDraft;
  composition: CatalogCompositionResult;
  renderer?: CatalogImageRenderer;
}

interface GeneratedImage {
  url: string;
  artifact: CatalogImageArtifact;
}

export function CatalogImageOutputControl({
  draft,
  composition,
  renderer,
}: CatalogImageOutputControlProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const imageRenderer = useMemo(() => renderer ?? new CanvasCatalogImageRenderer(), [renderer]);
  const signature = JSON.stringify({ draft, products: composition.included });

  useEffect(() => {
    generationRef.current += 1;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setGenerated(null);
    setError(null);
    setGenerating(false);
  }, [signature]);

  useEffect(() => () => {
    generationRef.current += 1;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const count = composition.included.length;
  const max = GLEEMOUR_CATALOG_IMAGE_PRESET.maxProducts;

  const generate = async () => {
    if (generating || count < 1 || count > max) return;
    const generation = ++generationRef.current;
    setGenerating(true);
    setError(null);
    try {
      const contract = toCatalogDraftContract(draft, composition);
      // This identity is local to the preview; publication needs a persisted version.
      const snapshot = createCatalogVersionSnapshot(contract, {
        catalogId: "gleemour-local-preview",
        catalogVersionId: "gleemour-local-preview-v1",
        versionNumber: 1,
      });
      const image = await imageRenderer.render(
        createCatalogCommercialComposition(snapshot, composition.included),
      );
      if (generation !== generationRef.current) return;
      const url = URL.createObjectURL(new Blob([Uint8Array.from(image.bytes)], { type: image.mimeType }));
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setGenerated({ url, artifact: image });
    } catch (cause) {
      if (generation === generationRef.current) {
        setError(cause instanceof Error ? cause.message : "No se pudo generar la imagen.");
      }
    } finally {
      if (generation === generationRef.current) setGenerating(false);
    }
  };

  return (
    <section className="gla-image-output" aria-labelledby="gla-image-output-title">
      <div className="gla-image-output-heading">
        <div>
          <span>05 · Salida comercial</span>
          <h2 id="gla-image-output-title">Imagen del catálogo</h2>
          <p>Genera un JPEG de 1080 × 1440 para revisar y descargar.</p>
        </div>
        <button type="button" onClick={generate} disabled={generating || count < 1 || count > max}>
          {generating ? <Loader2 size={17} className="gla-spin" aria-hidden="true" /> : <ImageIcon size={17} aria-hidden="true" />}
          {generating ? "Generando…" : "Generar imagen"}
        </button>
      </div>

      {count > max ? <p role="status">Selecciona hasta {max} productos para una imagen.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {generated ? (
        <div className="gla-image-output-result" role="status">
          <img src={generated.url} alt={`Vista previa de ${draft.settings.title || "Catálogo Gleemour"}`} />
          <div>
            <strong>Imagen lista</strong>
            <span>JPEG · 1080 × 1440 · {generated.artifact.checksumSha256.slice(0, 12)}…</span>
            {generated.artifact.warnings.length > 0 ? (
              <small>{generated.artifact.warnings.length} imagen(es) de producto usaron fondo de respaldo.</small>
            ) : null}
            <a href={generated.url} download={generated.artifact.filename}>
              <Download size={16} aria-hidden="true" /> Descargar JPEG
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
