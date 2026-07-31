import type { MusicTrack } from "@/domain/music";

export interface ProductMusicLibraryProps {
  tracks: MusicTrack[];
  selectedMusicId: string;
  loading: boolean;
  error: string | null;
  onSelectMusic: (musicId: string) => void;
}