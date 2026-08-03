import {
  ArrowLeft,
  Check,
  FileText,
  Heart,
} from "lucide-react";
import { useId } from "react";

import type { Product } from "@/shared/types/product";

import "./ExperienceDedication.css";

interface ExperienceDedicationProps {
  product: Product;
  value: string;
  confirmed: boolean;
  maxLength: number;
  onChange: (value: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function ExperienceDedication({
  product,
  value,
  confirmed,
  maxLength,
  onChange,
  onBack,
  onConfirm,
}: ExperienceDedicationProps) {
  const inputId = useId();
  const counterId = `${inputId}-counter`;
  const helperId = `${inputId}-helper`;

  const hasDedication = value.trim().length > 0;

  return (
    <section
      className="experience-dedication"
      aria-labelledby="experience-dedication-title"
    >
      <button
        type="button"
        className="experience-dedication__back"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a música
      </button>

      <header className="experience-dedication__header">
        <span className="experience-dedication__eyebrow">
          <FileText className="w-4 h-4" aria-hidden="true" />
          Mensaje personalizado
        </span>

        <h1 id="experience-dedication-title">
          Escribe una dedicatoria especial
        </h1>

        <p>
          La incluiremos en una tarjeta y podrás confirmarla antes de
          preparar el pedido. También puedes continuar sin escribir.
        </p>
      </header>

      <article className="experience-dedication__product">
        <div className="experience-dedication__product-image">
          <img
            src={product.img || "/placeholder.svg"}
            alt={product.title}
          />
        </div>

        <div className="experience-dedication__product-copy">
          <span>Arreglo principal</span>
          <strong>{product.title}</strong>
          <small>Ref. {product.id}</small>
        </div>

        <div className="experience-dedication__included">
          <Heart className="w-5 h-5" aria-hidden="true" />
          <span>Tarjeta incluida</span>
        </div>
      </article>

      <div className="experience-dedication__field">
        <label htmlFor={inputId}>
          Dedicatoria opcional
        </label>

        <textarea
          id={inputId}
          value={value}
          rows={7}
          maxLength={maxLength}
          aria-describedby={`${helperId} ${counterId}`}
          placeholder="Ejemplo: Gracias por estar siempre conmigo..."
          onChange={(event) => onChange(event.target.value)}
        />

        <div className="experience-dedication__field-footer">
          <span id={helperId}>
            Puedes usar saltos de línea, emojis y signos especiales.
          </span>

          <strong id={counterId}>
            {value.length}/{maxLength}
          </strong>
        </div>
      </div>

      <div
        className={[
          "experience-dedication__confirmation",
          confirmed
            ? "experience-dedication__confirmation--confirmed"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
      >
        {confirmed ? (
          <>
            <Check className="w-5 h-5" aria-hidden="true" />

            <div>
              <strong>
                {hasDedication
                  ? "Dedicatoria guardada en tu experiencia"
                  : "Continuarás sin dedicatoria"}
              </strong>

              <span>
                Puedes volver a editarla antes de finalizar el pedido.
              </span>
            </div>
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" aria-hidden="true" />

            <div>
              <strong>
                {hasDedication
                  ? "Tu mensaje está listo para confirmar"
                  : "La dedicatoria es opcional"}
              </strong>

              <span>
                Esta elección no modifica el precio del detalle.
              </span>
            </div>
          </>
        )}
      </div>

      <div className="experience-dedication__continue">
        <small>
          El mensaje permanece guardado mientras continúes en
          Experience Studio.
        </small>

        <button
          type="button"
          onClick={onConfirm}
        >
          {hasDedication
            ? "Confirmar dedicatoria"
            : "Continuar sin dedicatoria"}

          <Check className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
