import type { CSSProperties } from "react";

// Stile del testo, usato dalla grafica essenziale di Premiere e dai livelli di
// testo di After Effects (pannelli Carattere e Paragrafo).

export const FONTS = ["Nunito", "Arial", "Georgia", "Impact", "Courier New", "Trebuchet MS", "Times New Roman", "Verdana", "Comic Sans MS"] as const;

export interface TextStyle {
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  caps: boolean;
  align: "left" | "center" | "right";
  tracking: number;
  leading: number;
  stroke: { on: boolean; color: string; width: number };
  shadow: { on: boolean; color: string; opacity: number; distance: number; angle: number; blur: number };
  background: { on: boolean; color: string; opacity: number; pad: number };
}

export const defaultTextStyle = (size = 100): TextStyle => ({
  font: "Nunito",
  size,
  color: "#ffffff",
  bold: true,
  italic: false,
  underline: false,
  caps: false,
  align: "center",
  tracking: 0,
  leading: 1.15,
  stroke: { on: false, color: "#000000", width: 4 },
  shadow: { on: false, color: "#000000", opacity: 75, distance: 8, angle: 135, blur: 10 },
  background: { on: false, color: "#000000", opacity: 60, pad: 20 },
});

export function textCss(s: TextStyle): CSSProperties {
  const a = ((s.shadow.angle - 90) * Math.PI) / 180;
  const hex = (c: string, o: number) =>
    `rgba(${parseInt(c.slice(1, 3), 16)},${parseInt(c.slice(3, 5), 16)},${parseInt(c.slice(5, 7), 16)},${o / 100})`;
  return {
    fontFamily: s.font,
    fontSize: s.size,
    color: s.color,
    fontWeight: s.bold ? 900 : 400,
    fontStyle: s.italic ? "italic" : "normal",
    textDecoration: s.underline ? "underline" : "none",
    textTransform: s.caps ? "uppercase" : "none",
    textAlign: s.align,
    letterSpacing: `${s.tracking / 1000}em`,
    lineHeight: s.leading,
    whiteSpace: "pre",
    WebkitTextStroke: s.stroke.on ? `${s.stroke.width}px ${s.stroke.color}` : undefined,
    paintOrder: "stroke fill",
    textShadow: s.shadow.on ? `${Math.cos(a) * s.shadow.distance}px ${Math.sin(a) * s.shadow.distance}px ${s.shadow.blur}px ${hex(s.shadow.color, s.shadow.opacity)}` : undefined,
    background: s.background.on ? hex(s.background.color, s.background.opacity) : undefined,
    padding: s.background.on ? s.background.pad : undefined,
  };
}
