import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingBag } from "lucide-react";
import { BRAND_CONFIG } from "@/tenant/config/brand";
import { Product } from "@/shared/types/product";

const NAMES = [
  "María","Carmen","Rosa","Ana","Lucía","Patricia","Milagros","Diana",
  "Valeria","Andrea","Fernanda","Daniela","Alejandra","Claudia",
  "Jessica","Camila","Sofía","Renata","Gianella","Kiara"
];

const PLACES = [
  "Tacna","Centro","Gregorio Albarracín","Pocollay","Alto de la Alianza",
  "Ciudad Nueva"
];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface RecentActivityProps {
  products: Product[];
}

export function RecentActivity({ products }: RecentActivityProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [data, setData] = useState({
    name: "",
    place: "",
    product: "",
    time: 0,
  });

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  const show = useCallback(() => {
    if (products.length === 0) return;

    const product = random(products);

    setData({
      name: random(NAMES),
      place: random(PLACES),
      product: product.title,
      time: Math.floor(Math.random() * 12) + 2,
    });

    setLeaving(false);
    setVisible(true);

    schedule(() => {
      setLeaving(true);

      schedule(() => {
        setVisible(false);

        schedule(show, Math.floor(Math.random() * 25000) + 20000);
      }, 400);
    }, 5500);
  }, [products, schedule]);

  useEffect(() => {
    clearAllTimers();

    if (products.length === 0) return;

    schedule(show, 4000);

    return () => clearAllTimers();
  }, [products, show, schedule, clearAllTimers]);

  if (!visible) return null;

  return (
    <div
      className={`recent-activity ${
        leaving ? "recent-activity-out" : "recent-activity-in"
      }`}
    >
      <div className="recent-activity-card">
        <div className="recent-activity-icon">
          <ShoppingBag className="w-5 h-5" />
        </div>

        <div className="recent-activity-content">
          <span>{BRAND_CONFIG.activity.label}</span>

          <p>
            <strong>{data.name}</strong> sorprendió en{" "}
            <strong>{data.place}</strong> con{" "}
            <em>{data.product}</em>
          </p>

          <small>hace {data.time} minutos</small>
        </div>
      </div>
    </div>
  );
}


