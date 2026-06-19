import {
  Home,
  Info,
  MapPin,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import HomeSectionHeader from "../components/HomeSectionHeader";

const WHATSAPP_URL =
  "https://wa.me/51948122060?text=Hola%20Gleemour,%20quiero%20coordinar%20un%20pedido%20para%20recoger";

const infoItems = [
  {
    text: "Tacna, Perú",
    icon: MapPin,
  },
  {
    text: "Atención directa en tienda",
    icon: Home,
  },
  {
    text: "Coordinación por WhatsApp",
    icon: MessageCircle,
  },
];

export default function LocationSection() {
  return (
    <section
      id="ubicacion"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[var(--w-bg)] to-white py-16 md:py-20"
    >
      <div className="pointer-events-none absolute right-0 top-8 h-72 w-72 rounded-full bg-[var(--w-secondary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[var(--w-highlight)]/10 blur-3xl" />

      <div className="home-container relative z-10">
        <div className="mb-12 text-center">
          <HomeSectionHeader
            icon={MapPin}
            kicker="Ubicación y recojo"
            title="También puedes recoger tu detalle o visitarnos"
            description="Estamos en Tacna. Puedes acercarte directamente o coordinar tu pedido y recogerlo listo."
            align="center"
          />

          <div className="mx-auto mt-7 h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--w-highlight)] via-[var(--w-secondary)] to-[var(--w-primary)]" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          {/* MAPA */}
          <div className="overflow-hidden rounded-[34px] border border-[var(--w-border)] bg-white shadow-[var(--w-shadow-soft)]">
            <iframe
              title="Ubicación Gleemour en Tacna"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121544.82583806795!2d-70.334057!3d-18.014389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915acf610214c717%3A0x64b4c73bfda0d302!2sTacna!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
              className="h-[360px] w-full md:h-[460px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-center rounded-[34px] border border-[var(--w-border)] bg-white/90 p-7 shadow-[var(--w-shadow-soft)] backdrop-blur-xl md:p-9">
            <div className="grid gap-4">
              {infoItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.text}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--w-border)] bg-white/80 p-4 transition-all duration-300 hover:border-[var(--w-secondary)] hover:bg-[var(--w-secondary-soft)]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--w-primary-soft)] text-[var(--w-primary)] transition-all duration-300 group-hover:bg-[var(--w-secondary)] group-hover:text-white">
                      <Icon size={22} strokeWidth={1.9} />
                    </span>

                    <span className="text-sm font-bold text-[var(--w-heading)] md:text-base">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[28px] border border-[var(--w-secondary)]/25 bg-[var(--w-secondary-soft)] p-6">
              <div className="mb-3 flex items-center gap-3 text-[var(--w-primary)]">
                <ShoppingBag size={21} />
                <span className="text-xs font-black uppercase tracking-[0.18em]">
                  Recojo práctico
                </span>
              </div>

              <p className="text-lg font-bold leading-snug text-[var(--w-heading)]">
                Puedes comprar en tienda o coordinar tu pedido y recogerlo sin
                esperar.
              </p>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[var(--w-muted)]">
              <Info size={16} className="text-[var(--w-secondary)]" />
              Una opción práctica si quieres ahorrar tiempo o envío.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--w-primary)] px-8 py-4 text-sm font-bold text-white shadow-[0_18px_45px_rgba(106,90,138,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--w-secondary)] active:scale-95 sm:w-auto"
            >
              <MessageCircle size={19} />
              Coordinar recojo por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}



