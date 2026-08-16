import React from "react";
import { Inbox } from "lucide-react";

export const EmptyState = ({ title = "No items found", description = "There are no records to display at this time." }) => {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
      <Inbox size={36} color="var(--text-light)" style={{ marginBottom: "12px" }} />
      <h3 style={{ fontSize: "18px", color: "var(--text-main)", marginBottom: "4px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "360px", margin: "0 auto" }}>{description}</p>
    </div>
  );
};
