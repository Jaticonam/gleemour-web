import {
  CheckCircle2,
  Gift,
  MessageCircle,
  Send,
  ShoppingBag,
} from "lucide-react";
import HomeSectionHeader from "../components/HomeSectionHeader";

const WHATSAPP_URL =
  "https://wa.me/51948122060?text=Hola%20Gleemour,%20quiero%20hacer%20un%20pedido";

const steps = [
  {
    number: "1",
    title: "Elige tu detalle",
    description:
      "Explora naturales, artificiales o corporativos y encuentra el ideal.",
    icon: ShoppingBag,
  },
  {
    number: "2",
    title: "Escríbenos por WhatsApp",
    description: "Confirmamos disponibilidad, precio y entrega contigo.",
    icon: MessageCircle,
  },
  {
    number: "3",
    title: "Nosotros lo entregamos",
    description:
      "Preparamos tu detalle y coordinamos el envío para que llegue a tiempo.",
    icon: Send,
  },
];

export default function HowToBuySection() {
  return (
    <section
      id="como-comprar"
      className="relative overflow-hidden border-t border-[var(--w-border)] bg-gradient-to-b from-white via-[var(--w-bg)] to-[var(--w-bg)] py-16 md:py-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(236,164,194,0.12),transparent_70%)]" />

      <div className="home-container relative z-10">
        <div className="mb-12 text-center">
          <HomeSectionHeader
            icon={Gift}
            kicker="Cómo comprar"
            title="Elige lo que sientes, nosotros lo entregamos."
            description="Convierte tu intención en un detalle listo para sorprender, en pocos pasos."
            align="center"
          />

          <div className="mx-auto mt-7 h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--w-highlight)] via-[var(--w-secondary)] to-[var(--w-primary)]" />
        </div>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {steps.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.number}
                className="group relative overflow-hidden rounded-[30px] border border-[var(--w-border)] bg-white/90 p-7 shadow-[var(--w-shadow-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[var(--w-secondary)] hover:shadow-[var(--w-shadow-medium)]"
              >
                {/* número gigante */}
                <div className="pointer-events-none absolute -right-4 top-8 text-[120px] font-black leading-none text-slate-300/60 transition-colors duration-500 group-hover:text-slate-400/70">
                  {item.number}
                </div>

                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--w-secondary-soft)] text-[var(--w-primary)] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--w-secondary)] group-hover:text-white">
                    <Icon size={30} strokeWidth={1.8} />
                  </div>

                  <span className="mb-2 inline-flex rounded-full bg-[var(--w-secondary-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--w-secondary)] transition-colors duration-300 group-hover:bg-[var(--w-secondary)] group-hover:text-white">
                    Paso {item.number}
                  </span>

                  <h3 className="mb-3 text-2xl font-bold tracking-tight text-[var(--w-heading)]">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[var(--w-muted)]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[30px] border border-[var(--w-border)] bg-white/80 p-6 text-center shadow-[var(--w-shadow-soft)] backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-center gap-2 text-sm font-bold text-[var(--w-primary)]">
            <CheckCircle2 size={18} className="text-[var(--w-highlight)]" />
            Atención rápida, entregas coordinadas y detalles preparados con cuidado.
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[var(--w-primary)] px-8 py-4 text-sm font-bold text-white shadow-[0_18px_45px_rgba(106,90,138,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--w-secondary)] active:scale-95"
          >
            <MessageCircle size={19} />
            Pedir por WhatsApp ahora
          </a>
        </div>
      </div>
    </section>
  );
}


