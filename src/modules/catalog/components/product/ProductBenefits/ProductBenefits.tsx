import {
  Camera,
  Gift,
  MessageCircle,
  Sparkles,
  Truck,
} from "lucide-react";

import "./ProductBenefits.css";

const benefits = [
  {
    icon: Sparkles,
    title: "Presentación premium",
    text: "Cada detalle se prepara con acabado elegante y emocional.",
  },
  {
    icon: Gift,
    title: "Dedicatoria personalizada",
    text: "Incluye tarjeta con el mensaje que quieras enviar.",
  },
  {
    icon: MessageCircle,
    title: "Coordinación por WhatsApp",
    text: "Confirmamos detalles, horario y dedicatoria antes del envío.",
  },
  {
    icon: Camera,
    title: "Foto antes del envío",
    text: "Puedes recibir una vista previa antes de la entrega.",
  },
  {
    icon: Truck,
    title: "Entrega programada",
    text: "Coordinamos la entrega según disponibilidad y zona.",
  },
];

export function ProductBenefits() {
  return (
    <section className="product-benefits">
      <div className="product-benefits-header">
        <span>Compra con confianza</span>
        <h3>Tu detalle incluye</h3>
      </div>

      <div className="product-benefits-grid">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article className="product-benefit-card" key={benefit.title}>
              <div className="product-benefit-icon">
                <Icon className="w-4 h-4" />
              </div>

              <div>
                <h4>{benefit.title}</h4>
                <p>{benefit.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
