import { Crown, MessageCircle, Users, Video, Zap } from "lucide-react";
import HomeSectionHeader from "../components/HomeSectionHeader";
import { WhatsAppIcon } from "../ui/SocialIcons";

const vipBenefits = [
  {
    number: "1",
    label: "Beneficio",
    title: "Precios y preventas",
    description:
      "Compra con mejores precios por cajón y asegura mercadería antes de su llegada.",
    icon: Zap,
    color: "secondary",
  },
  {
    number: "2",
    label: "Directo",
    title: "Videollamadas",
    description:
      "Te mostramos productos en tiempo real para que compres con seguridad.",
    icon: Video,
    color: "primary",
  },
  {
    number: "3",
    label: "Exclusivo",
    title: "Grupo VIP",
    description:
      "Recibe preventas, promociones y oportunidades antes que el resto.",
    icon: Users,
    color: "accent",
  },
];

const colorStyles = {
  primary: {
    number: "group-hover:text-[#1d8299]/10",
    iconHover: "group-hover:bg-[#1d8299]",
    label: "bg-[#1d8299]/10 text-[#1d8299]",
    title: "group-hover:text-[#1d8299]",
  },
  secondary: {
    number: "group-hover:text-[#f286be]/10",
    iconHover: "group-hover:bg-[#f286be]",
    label: "bg-[#f286be]/10 text-[#f286be]",
    title: "group-hover:text-[#f286be]",
  },
  accent: {
    number: "group-hover:text-[#f5b025]/10",
    iconHover: "group-hover:bg-[#f5b025]",
    label: "bg-[#f5b025]/10 text-[#f5b025]",
    title: "group-hover:text-[#f5b025]",
  },
} as const;

export default function VipSection() {
  return (
    <section className="home-container pt-10 pb-16 md:pt-14 md:pb-20">
      <HomeSectionHeader
        icon={Crown}
        kicker="Acceso preferencial"
        title="Mayoristas VIP"
        description="Beneficios exclusivos para quienes quieren comprar mejor, acceder antes y vender con más estrategia."
        align="center"
      />
      {/* GRID LIBRE */}
      <div className="grid gap-6 md:grid-cols-3">
        {vipBenefits.map((item) => {
          const Icon = item.icon;
          const styles =
            colorStyles[item.color as keyof typeof colorStyles];

          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* número */}
              <div
                className={`pointer-events-none absolute right-5 top-5 z-0 select-none text-[85px] font-black leading-none text-slate-200/60 transition-colors duration-500 ${styles.number}`}
              >
                {item.number}
              </div>

              {/* header compacto */}
              <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
                
                <div className="flex items-center gap-3">
                  {/* icono (más compacto) */}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7b1d6]/20 text-[#f286be] shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:text-white ${styles.iconHover}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* título refinado */}
                  <h3
                    className={`text-[15px] font-semibold text-slate-950 transition-colors duration-300 ${styles.title}`}
                  >
                    {item.title}
                  </h3>
                </div>

                {/* label visible siempre */}
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${styles.label}`}
                >
                  {item.label}
                </span>
              </div>

              {/* descripción libre */}
              <p className="relative z-10 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA separado */}
      <div className="mt-10 text-center">
        <a
          href="https://wa.me/51936188636?text=Hola,%20quiero%20ser%20mayorista%20VIP"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-sm font-black text-white shadow-[0_10px_25px_rgba(37,211,102,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1ebe5d] hover:shadow-[0_15px_35px_rgba(37,211,102,0.5)] active:scale-95"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Quiero ser Mayorista ahora
        </a>

        <p className="mt-4 text-xs font-medium text-slate-500">
          Acceso inmediato por whatsapp con atención rápida y directa.
        </p>
      </div>
    </section>
  );
}



