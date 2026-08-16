import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Yunnan Unfolded — thoughtful journeys through Yunnan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#14362E",
          color: "#F7F3EB",
          padding: "72px 78px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="84" height="48" viewBox="0 0 84 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 41L23 15L39 34L51 20L82 41" stroke="#F7F3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="66" cy="10" r="5" fill="#C9A46A" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.9 }}>
            <span style={{ fontSize: 34, letterSpacing: 2 }}>YUNNAN</span>
            <span style={{ fontSize: 34, letterSpacing: 2, marginLeft: 24 }}>UNFOLDED</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ fontSize: 78, lineHeight: 0.95, letterSpacing: -2 }}>
            Thoughtful journeys through Yunnan.
          </div>
          <div
            style={{
              marginTop: 32,
              fontFamily: "sans-serif",
              fontSize: 24,
              letterSpacing: 1,
              color: "#D8D0C2",
            }}
          >
            Mountains · cultures · hidden corners · southwest China
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "sans-serif",
            fontSize: 20,
            letterSpacing: 2,
            color: "#C9A46A",
            textTransform: "uppercase",
          }}
        >
          <span>Yunnan, seen slowly</span>
          <span>yunnanunfolded.com</span>
        </div>
      </div>
    ),
    size,
  );
}
