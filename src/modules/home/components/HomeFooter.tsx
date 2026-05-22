import { Link } from "react-router-dom";
import {
  Award,
  BriefcaseBusiness,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  Truck,
} from "lucide-react";

const currentYear = new Date().getFullYear();

const promises = [
  {
    title: "Calidad premium",
    text: "Flores seleccionadas y diseños pensados para emocionar.",
    icon: Award,
  },
  {
    title: "Entrega cuidada",
    text: "Coordinamos cada detalle para que llegue bien presentado.",
    icon: Truck,
  },
  {
    title: "Experiencia única",
    text: "Detalles inspirados en emociones, momentos y canciones.",
    icon: Sparkles,
  },
];

const quickLinks = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Cómo comprar", href: "#como-comprar" },
  { label: "Corporativos", href: "#corporativos" },
  { label: "Entregas", href: "#envios" },
  { label: "Ubicación", href: "#ubicacion" },
];

export default function HomeFooter() {
  return (
    <footer className="mt-20 bg-[var(--w-primary-dark)] text-white">
      <div className="home-container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* MARCA */}
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-3xl font-bold tracking-wide text-white">
                Gleemour
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                Florería
              </span>
            </div>

            <p className="max-w-sm text-sm font-light leading-relaxed text-white/75">
              Transformamos emociones en experiencias que se sienten, a través
              de detalles inspirados en la música.
            </p>

            <Link
              to="/catalogo"
              className="inline-flex text-xs font-black uppercase tracking-[0.18em] text-[var(--w-secondary)] transition-colors hover:text-[var(--w-highlight)]"
            >
              Ver catálogo →
            </Link>
          </div>

          {/* PROMESA */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--w-highlight)]">
              Nuestra promesa
            </h4>

            <div className="space-y-5">
              {promises.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--w-secondary)]">
                      <Icon size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/60">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LINKS */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--w-highlight)]">
              Explorar
            </h4>

            <ul className="space-y-4 text-sm text-white/65">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("/") ? (
                    <Link
                      to={item.href}
                      className="transition-colors hover:text-[var(--w-secondary)]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-[var(--w-secondary)]"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACTO */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--w-highlight)]">
              Contacto
            </h4>

            <ul className="space-y-4 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--w-accent)]" />
                <span className="leading-relaxed">
                  Calle Gral. Vizquerra 264
                  <br />
                  Plaza Zela · Tacna, Perú
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--w-accent)]" />
                <span className="leading-relaxed">
                  De 10:00 a.m. a 10:00 p.m.
                </span>
              </li>

              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 shrink-0 text-[var(--w-accent)]" />
                <a
                  href="https://wa.me/51945122060"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold transition-colors hover:text-[var(--w-secondary)]"
                >
                  +51 945 122 060
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[var(--w-accent)]" />
                <a
                  href="mailto:gleemourfloreria@gmail.com"
                  className="transition-colors hover:text-[var(--w-secondary)]"
                >
                  gleemourfloreria@gmail.com
                </a>
              </li>

              <li className="flex items-start gap-3 pt-2 text-xs text-white/55">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-[var(--w-accent)]" />
                <span>
                  Insumos respaldados por{" "}
                  <a
                    href="https://www.woolyimports.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[var(--w-accent)] transition-colors hover:text-[var(--w-secondary)]"
                  >
                    Wooly Import Perú
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* BARRA INFERIOR */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            © {currentYear} Gleemour Florería · Tacna, Perú
          </p>

          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
            Detalles con emoción · Hecho con cuidado
          </p>
        </div>
      </div>
    </footer>
  );
}
