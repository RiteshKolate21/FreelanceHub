import React from "react";
import { Star } from "lucide-react";

export const RatingStars = ({ rating = 0, onChange = null, max = 5, size = 16 }) => {
  const isInteractive = typeof onChange === "function";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {Array.from({ length: max }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <Star
            key={idx}
            size={size}
            fill={isFilled ? "var(--accent-terracotta)" : "none"}
            color={isFilled ? "var(--accent-terracotta)" : "#C5C0B6"}
            style={{ cursor: isInteractive ? "pointer" : "default" }}
            onClick={() => isInteractive && onChange(starValue)}
          />
        );
      })}
      {!isInteractive && (
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginLeft: "4px" }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};
