import { Link } from "react-router-dom";
import { ShoppingBag, MessageCircle } from "lucide-react";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
      <Link
        to="/catalogo"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white font-bold shadow-lg"
      >
        <ShoppingBag size={18} />
        Catálogo
      </Link>

      <a
        href="https://wa.me/51936188636"
        target="_blank"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-green-500 text-white font-bold shadow-lg"
      >
        <MessageCircle size={18} />
        WhatsApp
      </a>
    </div>
  );
}


