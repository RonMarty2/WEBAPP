"use client";

import { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function GlassModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
}: ConfirmModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setShow(false), 200); // Wait for fade out
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* Backdrop */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(30, 27, 75, 0.15)", // Very light blue/navy backdrop
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          transition: "opacity 0.2s"
        }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "380px",
          background: "rgba(255, 255, 255, 0.85)", // Bright white glass
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
          borderRadius: "24px",
          padding: "28px 24px",
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          color: "#0f172a" // Dark text for contrast
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>
          <div style={{
            margin: "0 auto",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDestructive ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
            border: `1px solid ${isDestructive ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.2)"}`
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDestructive ? "#ef4444" : "#6366f1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, fontFamily: "var(--font-atkinson), sans-serif", color: "#1e293b" }}>
            {title}
          </h2>
          <p style={{ fontSize: "14px", lineHeight: 1.5, color: "#64748b", margin: "0 0 16px 0", fontFamily: "var(--font-atkinson), sans-serif" }}>
            {message}
          </p>

          <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "8px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                color: "#334155",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                transition: "all 0.2s"
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "10px",
                background: isDestructive ? "#ef4444" : "#6366f1",
                border: `1px solid ${isDestructive ? "#dc2626" : "#4f46e5"}`,
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: isDestructive ? "0 4px 12px rgba(239,68,68,0.25)" : "0 4px 12px rgba(99,102,241,0.25)",
                transition: "all 0.2s"
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
