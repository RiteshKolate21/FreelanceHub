import React from "react";

export const LoadingState = ({ message = "Loading content..." }) => {
  return (
    <div style={{ padding: "48px", textAlign: "center" }}>
      <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid var(--border-color)", borderTopColor: "var(--accent-dark)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
      <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
