import type { MusicTrack } from "@/domain/music";

type CsvRow = Record<string, string>;

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function parsePriority(value: unknown): number {
  const normalized = cleanText(value).replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(value: unknown): string {
  const raw = cleanText(value);
  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const statuses: Record<string, string> = {
    publicado: "Publicado",
    publicada: "Publicado",
    borrador: "Borrador",
  };

  return statuses[normalized] ?? raw;
}

export function normalizeMusicTrack(row: CsvRow): MusicTrack {
  return {
    id: cleanText(row.id),
    title: cleanText(row.title),
    description: cleanText(row.description),
    musicType: cleanText(row.music_type),
    moodMusical: cleanText(row.moodmusical),
    platform: cleanText(row.platform),
    priority: parsePriority(row.priority),
    status: normalizeStatus(row.status),
    url: cleanText(row.url),
  };
}