import type { ReactNode } from "react";
import {
  ArrowLeft,
  Heart,
  Sparkles,
} from "lucide-react";

import type { ExperienceMode } from "../../types/ExperienceEntry.types";

import "./ExperienceAppShell.css";

interface ExperienceAppShellProps {
  mode: ExperienceMode;
  onBack: () => void;
  children: ReactNode;
  summary: ReactNode;
}

export function ExperienceAppShell({
  mode,
  onBack,
  children,
  summary,
}: ExperienceAppShellProps) {
  return (
    <div className="experience-app">
      <header className="experience-app__header">
        <button
          type="button"
          className="experience-app__back"
          onClick={onBack}
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="experience-app__brand">
          <span>
            <Heart className="w-4 h-4" aria-hidden="true" />
            Gleemour
          </span>

          <strong>Experience Studio</strong>
        </div>

        <div className="experience-app__mode">
          <Sparkles className="w-4 h-4" aria-hidden="true" />

          <span>
            {mode === "guided"
              ? "Exploración guiada"
              : "Selección del arreglo"}
          </span>
        </div>
      </header>

      <div className="experience-app__layout">
        <main className="experience-app__workspace">
          {children}
        </main>

        <aside
          className="experience-app__summary"
          aria-label="Resumen del arreglo seleccionado"
        >
          {summary}
        </aside>
      </div>
    </div>
  );
}