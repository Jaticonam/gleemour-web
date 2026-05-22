import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ShoppingBag } from "lucide-react";

type HomeNavProps = {
  cartCount?: number;
  onCartClick?: () => void;
};

const catalogItems = [
  {
    label: "🌹 Naturales",
    href: "/catalogo/categoria.html?cat=naturales",
  },
  {
    label: "🌸 Artificiales",
    href: "/catalogo/categoria.html?cat=artificiales",
  },
  {
    label: "🏢 Corporativos",
    href: "/catalogo/categoria.html?cat=corporativos",
  },
];

export default function HomeNav({ cartCount = 0, onCartClick }: HomeNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--w-border)] bg-[var(--w-bg)]/90 backdrop-blur-xl">
      <div className="home-container">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center transition-all duration-300 hover:scale-[1.03]"
          >
            <div className="relative">
              <img
                src="https://gleemour.com/logo_color.png"
                alt="Logo Gleemour"
                className="h-11 object-contain transition-all duration-300 group-hover:scale-110 sm:h-14"
              />
              <span className="absolute inset-0 rounded-full bg-[var(--w-primary)]/20 opacity-0 blur-lg transition-all duration-300 group-hover:opacity-100" />
            </div>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Catálogo */}
            <div
              className="relative"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-[var(--w-text)] transition hover:bg-white hover:text-[var(--w-primary-dark)]"
              >
                Catálogo
                <ChevronDown
                  size={16}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-3xl border border-[var(--w-border)] bg-white/95 p-2 shadow-[var(--w-shadow-medium)] backdrop-blur-xl">
                  {catalogItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-sm font-bold text-[var(--w-text)] transition hover:bg-[var(--w-primary-soft)] hover:text-[var(--w-primary-dark)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Cómo comprar */}
            <a
              href="#como-comprar"
              className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-[var(--w-text)] transition hover:bg-white hover:text-[var(--w-primary-dark)] sm:inline-flex"
            >
              Cómo comprar
            </a>

            {/* Bolsa */}
            <button
              type="button"
              onClick={onCartClick}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--w-border)] bg-white text-[var(--w-primary-dark)] shadow-sm transition hover:scale-105 hover:bg-[var(--w-primary-soft)] hover:shadow-md"
              aria-label="Abrir bolsa"
            >
              <ShoppingBag size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--w-primary)] px-1.5 text-[10px] font-black text-white shadow-md ring-2 ring-[var(--w-bg)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
