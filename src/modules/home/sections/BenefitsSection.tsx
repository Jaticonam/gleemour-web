import {
  Layers,
  RotateCw,
  ShieldCheck,
  Store,
  Headphones,
  MapPin,
  Sparkles,
} from "lucide-react";
import HomeSectionHeader from "../components/HomeSectionHeader";

const pillars = [
  {
    number: "1",
    label: "ventaja",
    title: "Variedad real",
    description:
      "Todo lo que necesitas para vender, sin cambiar de proveedor.",
    icon: Layers,
    color: "primary",
  },
  {
    number: "2",
    label: "beneficio",
    title: "Alta rotación",
    description:
      "Productos que se venden rápido y liberan tu inversión.",
    icon: RotateCw,
    color: "secondary",
  },
  {
    number: "3",
    label: "garantía",
    title: "Calidad que vende",
    description:
      "Mejor presentación, mayor valor y clientes más satisfechos.",
    icon: ShieldCheck,
    color: "accent",
  },
  {
    number: "4",
    label: "eficiencia",
    title: "Compra inteligente",
    description:
      "Ahorra tiempo y dinero comprando todo en un solo lugar.",
    icon: Store,
    color: "primary",
  },
  {
    number: "5",
    label: "soporte",
    title: "Asesoría directa",
    description:
      "Te ayudamos por WhatsApp a elegir mejor y vender más.",
    icon: Headphones,
    color: "secondary",
  },
  {
    number: "6",
    label: "logística",
    title: "Envío nacional",
    description:
      "Recibe tu pedido rápido y sin complicaciones en todo el Perú.",
    icon: MapPin,
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

export default function BenefitsSection() {
  return (
    <section className="home-container pt-10 pb-12 md:pt-14 md:pb-16">

      <HomeSectionHeader
        icon={Sparkles}
        kicker="ventajas reales"
        title="Compra mejor. Vende más."
        description="Todo lo que necesitas para vender rápido, sin perder tiempo ni dinero."
        align="center"
      />
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {pillars.map((item) => {
          const Icon = item.icon;
          const styles = colorStyles[item.color as keyof typeof colorStyles];

          return (
            <div
              key={item.title}
              className="group relative w-full max-w-sm overflow-hidden rounded-[30px] border border-slate-200/70 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)]"
            >
              {/* número gigante */}
              <div
                className={`absolute -right-4 -top-8 text-[120px] font-black text-slate-200/70 transition-colors duration-500 ${styles.number}`}
              >
                {item.number}
              </div>

              <div className="relative z-10 mb-6 flex items-center justify-between">
                
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7b1d6]/20 text-[#f286be] transition-all duration-500 group-hover:scale-110 group-hover:text-white ${styles.iconHover}`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${styles.label}`}
                >
                  {item.label}
                </span>
              </div>

              <h3
                className={`mb-3 text-xl font-bold text-slate-950 transition-colors duration-300 ${styles.title}`}
              >
                {item.title}
              </h3>

              <p className="text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}



