import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function HeroSlider() {

  const [petals] = useState(() =>
    Array.from({ length: 24 }, (_, index) => {
      const size = Math.random() * 10 + 8;

      return {
        id: index,
        size,
        left: Math.random() * 100,
        duration: Math.random() * 8 + 8,
        delay: index < 6 ? 0 : Math.random() * 2,
        drift: Math.random() * 140 - 40,
        opacity: Math.random() * 0.35 + 0.35,
        blur: Math.random() > 0.75 ? 1.2 : 0,
        z: Math.random() > 0.65 ? 35 : 25,
      };
    })
  );

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">

      {/* PÉTALOS */}
      <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="petal"
            style={
              {
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                left: `${petal.left}%`,
                animationDuration: `${petal.duration}s`,
                animationDelay: `${petal.delay}s`,
                "--petal-drift": `${petal.drift}px`,
                "--petal-opacity": petal.opacity,
                "--petal-blur": `${petal.blur}px`,
                zIndex: petal.z,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* FONDO */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1920"
          alt="Gleemour portada"
          className="absolute inset-0 w-full h-full object-cover hero-zoom opacity-60"
        />
      </div>

      {/* OVERLAY */}
      <div className="hero-overlay" />

      {/* CONTENIDO */}
      <div className="relative z-30 text-center px-6 max-w-5xl">

        {/* BADGE */}
        <div className="fade-up">
          <span className="hero-badge px-6 py-2 uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold mb-8">
            ✨ Experiencias que inspiran
          </span>
        </div>

        {/* TÍTULO */}
        <h1 className="hero-text-glow text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-[1.1] reveal-up-delayed">
          Melodías en <br />
          <span className="relative inline-block italic font-light text-[var(--w-accent)] py-2">
            Cada Pétalo
          </span>
        </h1>

        {/* DESCRIPCIÓN */}
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 reveal-up-more-delayed font-light tracking-wide">
          Inspirado en las canciones que guardan los momentos más especiales.
          Cada creación nace para convertirse en un recuerdo que vive para siempre.
        </p>

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center reveal-up-more-delayed">
          <Link
            to="/catalogo"
            className="group flex items-center gap-2 rounded-full px-10 py-5 font-semibold text-white 
            bg-[var(--w-primary)] 
            shadow-[0_18px_45px_rgba(106,90,138,0.35)] 
            transition-all duration-300 
            hover:-translate-y-1 
            hover:bg-[var(--w-secondary)] 
            hover:shadow-[0_18px_45px_rgba(154,139,186,0.35)] 
            active:scale-95 
            active:bg-[var(--w-secondary)]"
          >
            Ver Catálogo
            <ArrowRight
              size={18}
              className="opacity-80 transition-transform group-hover:translate-x-1"
            />
          </Link>
          <a
            href="https://wa.me/51948122060"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-full border border-white/30 px-10 py-5 font-semibold text-white/90 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 active:scale-95"
          >
            <MessageCircle size={20} className="text-[var(--w-whatsapp)]" />
            WhatsApp Directo
          </a>
        </div>
      </div>

      {/* SCROLL */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 opacity-60">
        <span className="text-white text-[9px] uppercase tracking-[0.5em]">
          Deslizar
        </span>

        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-[var(--w-accent)] rounded-full animate-bounce-y" />
        </div>
      </div>

    </section>
  );
}





