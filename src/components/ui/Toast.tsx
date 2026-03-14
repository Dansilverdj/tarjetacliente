"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let addToastFn: ((msg: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = "success") {
  addToastFn?.(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message, type = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => { addToastFn = null; };
  }, []);

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "i",
  };
  const colors: Record<ToastType, string> = {
    success: "var(--success)",
    error: "var(--error)",
    info: "#7B68EE",
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span style={{
            width: 20, height: 20, borderRadius: "50%", background: colors[t.type],
            color: "#000", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
