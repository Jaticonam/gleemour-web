import "./NotificationStack.css";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";

interface Toast {
  id: number;
  title: string;
  message: string;
  leaving: boolean;
}

let toastId = 0;

type Listener = (title: string, message: string) => void;
const listeners: Set<Listener> = new Set();

export function showNotification(title: string, message: string) {
  listeners.forEach((fn) => fn(title, message));
}

export function NotificationStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((title: string, message: string) => {
    const id = ++toastId;

    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
        leaving: false,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, leaving: true } : toast
        )
      );

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 300);
    }, 2500);
  }, []);

  useEffect(() => {
    listeners.add(addToast);

    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  return (
    <div className="notification-stack">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={toast.leaving ? "notification-toast-out" : "notification-toast-in"}
        >
          <div className="notification-toast">
            <div className="notification-toast-icon">
              <CheckCircle className="w-5 h-5" />
            </div>

            <div className="notification-toast-content">
              <span>{toast.title}</span>
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}




