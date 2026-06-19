import {
  Gift,
  Heart,
  HeartHandshake,
  MapPin,
  Music,
  PartyPopper,
  Sparkles,
  Star,
} from "lucide-react";

import { WhatsAppIcon } from "../ui/SocialIcons";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";

const emotionalCategories = [
  {
    icon: Heart,
    label: "Para enamorar",
    description: "Amor, conquista y romanticismo",
  },
  {
    icon: Sparkles,
    label: "Momentos especiales",
    description: "Fechas importantes y ocasiones memorables",
  },
  {
    icon: Gift,
    label: "Para sorprender",
    description: "Detalles inesperados que emocionan",
  },
  {
    icon: PartyPopper,
    label: "Para celebrar",
    description: "Cumpleaños, logros y momentos felices",
  },
  {
    icon: Star,
    label: "Para agradecer",
    description: "Gratitud y aprecio sincero",
  },
  {
    icon: HeartHandshake,
    label: "Pedir perdón",
    description: "Reconciliación y segundas oportunidades",
  },
];

export default function BrandStorySection() {
  return (
    <section className="home-container brand-story-section">
      <div className="brand-story-grid">
        <div className="brand-story-image-wrap">
          <div className="brand-story-image-bg" />

          <img
            src="https://dl.dropboxusercontent.com/scl/fi/ixrlm1m9hoia84zuuoef5/NAT_AMA_001.jpg?rlkey=07e39hpq6i8hogrdxi6stcqvu&st=o4fc1nh4&raw=1"
            alt="Arreglo floral Gleemour inspirado en música y emociones"
            className="brand-story-image"
            loading="lazy"
          />

          <div className="brand-story-floating-card">
            <span>Flores + música + emoción</span>
            <strong>Experiencias que se recuerdan</strong>
          </div>
        </div>

        <div className="brand-story-content">
          <HomeSectionHeader
            icon={Music}
            kicker="Nuestra esencia"
            title="Transformamos sentimientos en experiencias memorables"
            align="left"
          />

          <div className="brand-story-copy">
            <p>
              <strong>Gleemour</strong> es una marca de flores y regalos
              emocionales inspirada en la música, creada para convertir
              sentimientos en detalles que se viven, se sienten y se recuerdan.
            </p>

            <p>
              Cada arreglo combina estética, significado y emoción para acompañar
              momentos especiales, celebrar vínculos y decir aquello que a veces
              las palabras no alcanzan.
            </p>
            
            <p className="brand-story-highlight">
              No vendemos solo flores: diseñamos mensajes emocionales con forma
              de regalo.
            </p>
          </div>

          <div className="brand-story-emotions">
            {emotionalCategories.map((category) => {
              const Icon = category.icon;

              return (
                <div key={category.label} className="brand-story-emotion-item">
                  <div className="brand-story-emotion-icon">
                    <Icon size={17} strokeWidth={1.8} />
                  </div>

                  <div>
                    <strong>{category.label}</strong>
                    <span>{category.description}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}





