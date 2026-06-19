import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Gift,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import HomeSectionHeader from "../components/HomeSectionHeader";

const WHATSAPP_URL =
  "https://wa.me/51948122060?text=Hola%20Gleemour,%20quiero%20cotizar%20detalles%20corporativos";

const benefits = [
  "Personalización con tu marca",
  "Producción según necesidad",
  "Entregas coordinadas",
  "Atención directa y asesoría",
];

const useCases = [
  {
    title: "Regalos para clientes",
    icon: Gift,
  },
  {
    title: "Detalles para colaboradores",
    icon: Users,
  },
  {
    title: "Eventos y campañas",
    icon: Sparkles,
  },
  {
    title: "Fechas especiales",
    icon: CalendarCheck,
  },
];

const trustedCompanies = [
  "Empresas locales",
  "Instituciones",
  "Equipos comerciales",
  "Eventos corporativos",
];

export default function CorporateSection() {
  return (
    <section
      id="corporativos"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--w-bg)] via-white to-[var(--w-bg)] py-16 md:py-20"
    >
      {/* Fondos suaves */}
      <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-[var(--w-secondary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[var(--w-highlight)]/10 blur-3xl" />

      <div className="home-container relative z-10">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <HomeSectionHeader
            icon={BriefcaseBusiness}
            kicker="Para empresas"
            title="Detalles corporativos que conectan"
            description="Sorprende a clientes, equipos y aliados con detalles que representan la esencia de tu marca."
            align="center"
          />

          <div className="mx-auto mt-7 h-1.5 w-24 rounded-full bg-gradient-to-r from-[var(--w-highlight)] via-[var(--w-secondary)] to-[var(--w-primary)]" />
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-7">
            {/* Beneficios */}
            <div className="rounded-[30px] border border-[var(--w-border)] bg-white/90 p-7 shadow-[var(--w-shadow-soft)] backdrop-blur-xl md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-0.5 w-7 rounded-full bg-[var(--w-highlight)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[var(--w-primary)]">
                  Lo que obtienes
                </h3>
              </div>

              <ul className="grid gap-4 sm:grid-cols-2">
                {benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-bold leading-relaxed text-[var(--w-heading)]"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--w-highlight)]/40 bg-[var(--w-highlight-soft)] text-[var(--w-highlight)]">
                      <CheckCircle2 size={16} strokeWidth={2.4} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Usos */}
            <div className="rounded-[30px] border border-[var(--w-border)] bg-white/80 p-7 shadow-[var(--w-shadow-soft)] backdrop-blur-xl md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-0.5 w-7 rounded-full bg-[var(--w-secondary)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[var(--w-primary)]">
                  Ideal para
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {useCases.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group flex items-center gap-3 rounded-2xl border border-[var(--w-border)] bg-white/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--w-secondary)] hover:bg-[var(--w-secondary-soft)]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--w-primary-soft)] text-[var(--w-primary)] transition-all duration-300 group-hover:bg-[var(--w-secondary)] group-hover:text-white">
                        <Icon size={21} strokeWidth={1.8} />
                      </span>

                      <span className="text-sm font-bold text-[var(--w-heading)]">
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAS */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/catalogo"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--w-border)] bg-white px-8 py-4 text-sm font-bold text-[var(--w-primary)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--w-secondary)] hover:bg-[var(--w-secondary-soft)] sm:w-auto"
              >
                Ver catálogo
                <ArrowRight size={17} />
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--w-primary)] px-8 py-4 text-sm font-bold text-white shadow-[0_18px_45px_rgba(106,90,138,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--w-secondary)] active:scale-95 sm:w-auto"
              >
                <MessageCircle size={19} />
                Cotizar por WhatsApp
              </a>
            </div>
          </div>

          {/* COLUMNA DERECHA / VISUAL */}
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-[var(--w-secondary)]/20 blur-3xl" />
            <div className="absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-[var(--w-highlight)]/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[var(--w-shadow-medium)]">
              <img
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200"
                alt="Detalles corporativos Gleemour"
                className="h-[420px] w-full object-cover md:h-[520px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="rounded-[28px] border border-white/25 bg-white/15 p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-[var(--w-highlight)]">
                    Soluciones corporativas
                  </span>

                  <p className="text-lg font-bold leading-snug md:text-xl">
                    Detalles listos para campañas, fechas especiales y gestos de reconocimiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MICRO PRUEBA SOCIAL */}
        <div className="mt-12 rounded-[30px] border border-[var(--w-border)] bg-white/70 p-6 text-center shadow-[var(--w-shadow-soft)] backdrop-blur-xl">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[var(--w-primary)]">
            Empresas e instituciones que pueden confiar en Gleemour
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustedCompanies.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--w-border)] bg-white px-5 py-2 text-xs font-bold text-[var(--w-muted)] transition-all duration-300 hover:border-[var(--w-secondary)] hover:text-[var(--w-primary)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


