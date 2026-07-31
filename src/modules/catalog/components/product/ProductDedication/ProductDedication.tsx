import { FileText, Heart } from "lucide-react";
import { useId } from "react";

import "./ProductDedication.css";

interface ProductDedicationProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function ProductDedication({
  value,
  onChange,
  maxLength = 240,
}: ProductDedicationProps) {
  const inputId = useId();

  return (
    <section
      className="product-dedication"
      aria-labelledby={`${inputId}-title`}
    >
      <header className="product-dedication__header">
        <span className="product-dedication__eyebrow">
          <FileText className="w-4 h-4" aria-hidden="true" />
          Mensaje personalizado
        </span>

        <span className="product-dedication__included">
          <Heart className="w-3.5 h-3.5" aria-hidden="true" />
          Incluida
        </span>

        <h3 id={`${inputId}-title`}>
          Escribe una dedicatoria especial
        </h3>

        <p>
          La incluiremos en una tarjeta y la confirmaremos contigo
          antes de preparar el pedido.
        </p>
      </header>

      <label className="product-dedication__field" htmlFor={inputId}>
        <span>Dedicatoria opcional</span>

        <textarea
          id={inputId}
          value={value}
          maxLength={maxLength}
          rows={5}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ejemplo: Gracias por estar siempre conmigo..."
        />
      </label>

      <footer className="product-dedication__footer">
        <span>Puedes modificarla antes de confirmar.</span>
        <strong>
          {value.length}/{maxLength}
        </strong>
      </footer>
    </section>
  );
}