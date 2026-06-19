import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

type UrgencyLevel = "normal" | "warning" | "danger";

const dispatchDays = [1, 3, 5]; // lunes, miércoles, viernes
const cutoffHour = 16; // 4PM

const dayNames = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

// 🔥 MOTOR: calcula próximo despacho real
const getNextDispatch = () => {
  const now = new Date();
  const today = now.getDay();

  const isDispatchToday = dispatchDays.includes(today);

  const todayCutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    cutoffHour,
    0,
    0
  );

  // ✅ HOY
  if (isDispatchToday && now < todayCutoff) {
    return {
      date: todayCutoff,
      mode: "today" as const,
    };
  }

  // 🔄 BUSCAR SIGUIENTE
  for (let i = 1; i <= 7; i++) {
    const next = new Date(now);
    next.setDate(now.getDate() + i);

    if (dispatchDays.includes(next.getDay())) {
      next.setHours(cutoffHour, 0, 0);

      return {
        date: next,
        mode: "next" as const,
      };
    }
  }

  return {
    date: todayCutoff,
    mode: "next" as const,
  };
};

export function CountdownTimer() {
  const [time, setTime] = useState("00h : 00m : 00s");
  const [urgency, setUrgency] = useState<UrgencyLevel>("normal");
  const [mode, setMode] = useState<"today" | "next">("next");
  const [labelText, setLabelText] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const { date, mode } = getNextDispatch();

      setMode(mode);

      const diff = date.getTime() - now.getTime();

      if (diff <= 0) {
        setTime("00h : 00m : 00s");
        setUrgency("danger");
        return;
      }

      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setTime(`${h}h : ${m}m : ${s}s`);

      const minutesLeft = Math.floor(diff / 60000);

      // 🎯 URGENCIA
      if (minutesLeft <= 90) {
        setUrgency("danger");
      } else if (minutesLeft <= 240) {
        setUrgency("warning");
      } else {
        setUrgency("normal");
      }

      // 📆 DÍA + DIFERENCIA
      const diffDays = Math.ceil(
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const dispatchDayName = dayNames[date.getDay()];

      // 🧠 COPY FINAL (VENDEN)
      let text = "";

      if (mode === "today") {
        if (minutesLeft <= 90) {
          text = "🔥 Últimos minutos — sale hoy";
        } else if (minutesLeft <= 240) {
          text = "🚚 Sale hoy — aprovecha ahora";
        } else {
          text = "🚚 Sale hoy — solo quedan";
        }
      } else {
        const isTomorrow = diffDays === 1;

        text = isTomorrow
          ? `📦 Sale mañana (${dispatchDayName}) — asegura tu pedido hoy`
          : `📦 Sale ${dispatchDayName} — asegura tu pedido hoy`;
      }

      setLabelText(text);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // 🎨 ESTILOS (los tuyos intactos)
  const bannerClass =
    urgency === "danger"
      ? "bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-red-500"
      : urgency === "warning"
      ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-amber-300"
      : "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 border-emerald-300";

  const textColor =
    urgency === "warning" ? "text-slate-900" : "text-white";

  const timerBoxClass =
    urgency === "danger"
      ? "bg-white text-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
      : urgency === "warning"
      ? "bg-white text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
      : "bg-white text-green-600 shadow-[0_0_15px_rgba(34,197,94,0.4)]";

  return (
    <div
      className={`w-full flex justify-center items-center py-3 px-2 gap-2 md:gap-4 shadow-xl z-20 border-b transition-all duration-300 ${bannerClass}`}
    >
      <Timer
        className={`w-5 h-5 md:w-6 md:h-6 ${textColor} ${
          urgency === "danger" ? "animate-pulse" : ""
        }`}
      />

      <span
        className={`text-[10px] md:text-sm font-black tracking-widest ${textColor}`}
      >
        {labelText}
      </span>

      <div
        className={`px-3 py-1.5 md:px-5 md:py-2 rounded-xl text-[14px] md:text-[20px] font-black tracking-widest transition-all duration-300 ${timerBoxClass} ${
          urgency === "danger" ? "animate-pulse" : ""
        }`}
      >
        {time}
      </div>
    </div>
  );
} 



