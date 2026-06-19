import {
  Bike,
  Car,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import HomeSectionHeader from "../components/HomeSectionHeader";

const WHATSAPP_URL =
  "https://wa.me/51948122060?text=Hola%20Gleemour,%20quiero%20coordinar%20una%20entrega";

const deliveryOptions = [
  {
    title: "Moto Carrera",
    subtitle: "Entrega rápida",
    description: "Ideal cuando necesitas sorprender hoy, sin esperar demasiado.",
    icon: Bike,
  },
  {
    title: "Taxi",
    subtitle: "Cobertura en Tacna",
    description: "Llegamos donde lo necesites, sin complicaciones.",
    icon: Car,
  },
  {
    title: "Minivan Gleemour",
    subtitle: "Entrega cuidada",
    description: "Pensado para detalles grandes o presentaciones especiales.",
    icon: Truck,
  },
];

export default function ShippingSection() {
  return (
    <section
      id="envios"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[var(--w-bg)] to-white py-16 md:py-20"
    >
      <div className="pointer-events-none absolute left-0 top-10 h-72 w-72 rounded-full bg-[var(--w-secondary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[var(--w-highlight)]/10 blur-3xl" />

      <div className="home-container relative z-10">
        <div className="mb-12 text-center">
          <HomeSectionHeader
            icon={Truck}
            kicker="Entregas"
            title="Llegamos a todos los distritos de Tacna"
            description="Elige cómo quieres que llegue tu detalle. Nosotros nos encargamos de que sea puntual y especial."
            align="center"
          />

          <div className="mx-auto mt-7 h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--w-highlight)] via-[var(--w-secondary)] to-[var(--w-primary)]" />
        </div>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {deliveryOptions.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-[30px] border border-[var(--w-border)] bg-white/90 p-7 text-center shadow-[var(--w-shadow-soft)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[var(--w-secondary)] hover:shadow-[var(--w-shadow-medium)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--w-secondary)]/10 blur-2xl transition-all duration-500 group-hover:bg-[var(--w-highlight)]/20" />

                <div className="relative z-10">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--w-secondary-soft)] text-[var(--w-primary)] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--w-secondary)] group-hover:text-white">
                    <Icon size={31} strokeWidth={1.8} />
                  </div>

                  <span className="mb-2 inline-flex rounded-full bg-[var(--w-secondary-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--w-secondary)] transition-colors duration-300 group-hover:bg-[var(--w-secondary)] group-hover:text-white">
                    {item.subtitle}
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
            <ShieldCheck size={18} className="text-[var(--w-highlight)]" />
            Coordinamos cada entrega para que tu detalle llegue bien presentado y a tiempo.
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[var(--w-primary)] px-8 py-4 text-sm font-bold text-white shadow-[0_18px_45px_rgba(106,90,138,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--w-secondary)] active:scale-95"
          >
            <MessageCircle size={19} />
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}


