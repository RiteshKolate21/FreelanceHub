import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="toast-container">
      <div className="toast">
        {type === "success" ? <CheckCircle2 size={18} color="#4ADE80" /> : <AlertCircle size={18} color="#F87171" />}
        <span>{message}</span>
      </div>
    </div>
  );
};
