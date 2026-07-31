import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flower2,
  Heart,
  MessageSquareText,
  Music2,
  Sparkles,
} from "lucide-react";

import { getExperienceUrl } from "@/app/routes/routes";

import "./ExperienceInvitationSection.css";

const EXPERIENCE_FEATURES = [
  {
    icon: Flower2,
    label: "Encuentra el arreglo ideal",
  },
  {
    icon: Music2,
    label: "Elige la música",
  },
  {
    icon: MessageSquareText,
    label: "Crea tu mensaje",
  },
];

export default function ExperienceInvitationSection() {
  return (
    <section className="experience-invitation-section">
      <div className="experience-invitation-section__inner">
        <div className="experience-invitation-section__content">
          <span className="experience-invitation-section__eyebrow">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Gleemour Experience Studio
          </span>

          <h2>Vive la experiencia de visitar nuestra florería</h2>

          <p>
            Cuéntanos qué deseas expresar y te acompañaremos a elegir
            el arreglo, la música, los complementos y el mensaje ideal.
          </p>

          <div className="experience-invitation-section__features">
            {EXPERIENCE_FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <span key={feature.label}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {feature.label}
                </span>
              );
            })}
          </div>

          <Link
            to={getExperienceUrl("home")}
            className="experience-invitation-section__cta"
          >
            Visitar nuestra florería
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        <div
          className="experience-invitation-section__visual"
          aria-hidden="true"
        >
          <div className="experience-invitation-section__orb">
            <Heart className="w-12 h-12" />
          </div>

          <div className="experience-invitation-section__card experience-invitation-section__card--one">
            <Flower2 className="w-5 h-5" />
            <span>Arreglos</span>
          </div>

          <div className="experience-invitation-section__card experience-invitation-section__card--two">
            <Music2 className="w-5 h-5" />
            <span>Música</span>
          </div>

          <div className="experience-invitation-section__card experience-invitation-section__card--three">
            <MessageSquareText className="w-5 h-5" />
            <span>Mensaje</span>
          </div>
        </div>
      </div>
    </section>
  );
}