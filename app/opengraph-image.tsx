import { ImageResponse } from "next/og";

export const alt = "Rosmawati Thailor — Butik & Jahit Custom";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf8f4",
          color: "#33292a",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            color: "#8c5b60",
            textTransform: "uppercase",
          }}
        >
          Butik &amp; Jahit Custom
        </div>
        <div style={{ display: "flex", fontSize: 88, marginTop: 28 }}>
          Rosmawati Thailor
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontStyle: "italic",
            color: "#80565b",
            marginTop: 16,
          }}
        >
          Elegance is in every stitch.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            fontSize: 20,
            letterSpacing: 4,
            color: "#6f6265",
          }}
        >
          MADE WITH CARE · INDONESIA
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
