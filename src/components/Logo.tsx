"use client";

import React from "react";

export function StravaLogo({ size = 32, color = "#FC5200", showText = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 48 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.5 0L0 28.5H9.5L14.5 18.5L19.5 28.5H29L14.5 0Z"
          fill={color}
        />
        <path
          d="M34.5 13L27.5 28.5H34.5L37.5 22L40.5 28.5H47.5L40.5 13H34.5Z"
          fill={color}
        />
      </svg>
      {showText && (
        <span
          style={{
            color: color,
            fontSize: "24px",
            fontWeight: "900",
            letterSpacing: "-1.5px",
            textTransform: "lowercase",
            fontFamily: "var(--font-inter), sans-serif",
            display: "inline-block",
            transform: "scaleY(1.1)",
            lineHeight: "1"
          }}
        >
          stavra
        </span>
      )}
    </div>
  );
}
