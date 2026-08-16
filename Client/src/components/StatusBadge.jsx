import React from "react";

export const StatusBadge = ({ status }) => {
  const sanitizedStatus = (status || "").replace(/\s+/g, "-");
  return (
    <span className={`status-badge status-${sanitizedStatus}`}>
      {status}
    </span>
  );
};
