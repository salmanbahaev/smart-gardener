import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }: { message: string, type?: "info" | "error" | "success", onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const color = type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-zinc-700";

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium text-base ${color} animate-fade-in`}
      role="alert">
      {message}
    </div>
  );
} 