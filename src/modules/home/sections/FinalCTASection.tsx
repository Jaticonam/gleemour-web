import { Quote, ShoppingCart } from "lucide-react";
import { WhatsAppIcon } from "../ui/SocialIcons";

export default function FinalCTASection() {
  return (
    <section className="w-full border-t border-slate-200/60 bg-gradient-to-b from-white to-slate-50 py-16 md:py-24 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="home-container relative text-center">
        
        {/* icono */}
        <Quote className="mx-auto mb-6 h-10 w-10 text-[#f286be]/30 md:h-14 md:w-14" />

        {/* frase */}
        <blockquote className="mx-auto max-w-4xl text-[1.65rem] leading-relaxed text-slate-900 md:text-4xl">
          La que compra por mayor, vende más...
          <span className="mt-4 block bg-gradient-to-r from-[#1d8299] to-[#f286be] bg-clip-text text-3xl font-black text-transparent md:text-5xl">
            pero la que compra por caja, factura más.
          </span>
        </blockquote>

        {/* botones */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
          
          {/* botón principal whatsapp */}
          <a
            href="https://wa.me/51936188636?text=Hola,%20quiero%20comprar%20por%20mayor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#25d366] px-8 py-4 text-sm font-black text-white shadow-[0_10px_25px_rgba(37,211,102,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1ebd5a] hover:shadow-[0_15px_35px_rgba(37,211,102,0.5)] active:scale-95 md:w-auto"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Comprar por mayor
          </a>

          {/* botón secundario */}
          <a
            href="/catalogo"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#1d8299] px-8 py-4 text-sm font-black text-[#1d8299] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1d8299] hover:text-white active:scale-95 md:w-auto"
          >
            <ShoppingCart className="h-5 w-5" />
            Ver catálogo
          </a>
        </div>

        {/* microcopy */}
        <p className="mt-5 text-xs font-medium text-slate-500">
          Compra rápida por whatsapp o arma tu pedido desde el catálogo
        </p>
      </div>
    </section>
  );
}



