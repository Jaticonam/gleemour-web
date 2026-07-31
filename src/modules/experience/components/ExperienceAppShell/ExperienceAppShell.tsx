import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Flower2,
  Gift,
  Heart,
  Home,
  MessageSquareText,
  Music2,
  PackageSearch,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";

import type {
  ExperienceMode,
  ExperienceSectionId,
} from "../../types/ExperienceEntry.types";

import "./ExperienceAppShell.css";

interface ExperienceNavigationItem {
  id: ExperienceSectionId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

const NAVIGATION_ITEMS: ExperienceNavigationItem[] = [
  {
    id: "inicio",
    label: "Inicio",
    shortLabel: "Inicio",
    icon: Home,
  },
  {
    id: "arreglos",
    label: "Arreglos",
    shortLabel: "Arreglos",
    icon: Flower2,
  },
  {
    id: "presentacion",
    label: "Presentación",
    shortLabel: "Present.",
    icon: Sparkles,
  },
  {
    id: "complementos",
    label: "Complementos",
    shortLabel: "Extras",
    icon: Gift,
  },
  {
    id: "musica",
    label: "Música",
    shortLabel: "Música",
    icon: Music2,
  },
  {
    id: "mensaje",
    label: "Mensaje",
    shortLabel: "Mensaje",
    icon: MessageSquareText,
  },
  {
    id: "entrega",
    label: "Entrega",
    shortLabel: "Entrega",
    icon: Truck,
  },
  {
    id: "resumen",
    label: "Mi experiencia",
    shortLabel: "Resumen",
    icon: WalletCards,
  },
];

interface ExperienceAppShellProps {
  mode: ExperienceMode;
  activeSection: ExperienceSectionId;
  onSectionChange: (section: ExperienceSectionId) => void;
  onBack: () => void;
  children: ReactNode;
  summary: ReactNode;
}

export function ExperienceAppShell({
  mode,
  activeSection,
  onSectionChange,
  onBack,
  children,
  summary,
}: ExperienceAppShellProps) {
  const activeIndex = NAVIGATION_ITEMS.findIndex(
    (item) => item.id === activeSection,
  );

  const progress = Math.max(
    1,
    Math.round(
      ((activeIndex + 1) / NAVIGATION_ITEMS.length) * 100,
    ),
  );

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

        <div className="experience-app__progress">
          <div>
            <span>
              {mode === "guided"
                ? "Experiencia guiada"
                : "Personalización"}
            </span>

            <strong>{progress}%</strong>
          </div>

          <div
            className="experience-app__progress-track"
            aria-label={`Progreso ${progress}%`}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className="experience-app__layout">
        <nav
          className="experience-app__navigation"
          aria-label="Secciones de Experience Studio"
        >
          <div className="experience-app__navigation-heading">
            <PackageSearch className="w-5 h-5" aria-hidden="true" />

            <div>
              <span>Tu recorrido</span>
              <strong>Diseña la experiencia</strong>
            </div>
          </div>

          <div className="experience-app__navigation-list">
            {NAVIGATION_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const active = item.id === activeSection;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "experience-app__navigation-item",
                    active
                      ? "experience-app__navigation-item--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSectionChange(item.id)}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="experience-app__navigation-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <Icon className="w-4 h-4" aria-hidden="true" />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <main className="experience-app__workspace">
          {children}
        </main>

        <aside
          className="experience-app__summary"
          aria-label="Resumen de la experiencia"
        >
          {summary}
        </aside>
      </div>

      <nav
        className="experience-app__mobile-navigation"
        aria-label="Navegación móvil de Experience Studio"
      >
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeSection;

          return (
            <button
              key={item.id}
              type="button"
              className={
                active
                  ? "experience-app__mobile-item experience-app__mobile-item--active"
                  : "experience-app__mobile-item"
              }
              onClick={() => onSectionChange(item.id)}
              aria-current={active ? "step" : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}