import { ImageResponse } from "next/og";

export const alt = "CollabBoard — a collaborative workspace for teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori (next/og) does not read CSS variables or Tailwind, so the brand values are
// inlined here. Keep them in step with --primary / --background in globals.css.
const accent = "#5b4bdb";
const surface = "#0e0e14";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: `radial-gradient(circle at 78% 30%, ${accent}55, transparent 55%), ${surface}`,
        color: "#f5f5f7",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            background: accent,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
          CollabBoard
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
            maxWidth: 900,
          }}
        >
          Make good ideas easier to see.
        </div>
        <div style={{ fontSize: 30, color: "#a1a1ad", maxWidth: 760 }}>
          One shared room to shape thoughts, align on what matters, and move
          forward together.
        </div>
      </div>
    </div>,
    size,
  );
}
