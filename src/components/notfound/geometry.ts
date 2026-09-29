/**
 * The seam is a line through the viewport. The terminal half is every point p
 * with dot(p - P, n) >= 0, where P = center + offset * n and n is the line's
 * normal. angle is the line direction; n = (sin, -cos) points into the terminal.
 */
export type Seam = { angle: number; offset: number };
export type Pt = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export const MOBILE_BP = 720;

/**
 * Phones stack vertically: 404 card, a gap the seam runs through, then the shell.
 * The seam sits mid-gap with a slight tilt so both keys and the star have room.
 */
function mobileGeom(W: number, H: number) {
  const short = H < 720;
  const w404 = { x: 12, y: 70, w: W - 24, h: short ? 184 : 208 };
  const sh = Math.round(Math.min(360, Math.max(250, H * 0.4)));
  const shell = { x: 10, y: H - sh - 10, w: W - 20, h: sh };
  const gapTop = w404.y + w404.h;
  const yc = gapTop + (shell.y - gapTop) * 0.42;
  const drop = Math.min(40, H * 0.05);
  return { w404, shell, yc, drop };
}

export function defaultSeam(W: number, H: number): Seam {
  if (W < MOBILE_BP) {
    const { yc, drop } = mobileGeom(W, H);
    const angle = Math.atan2(-drop, -W);
    return { angle, offset: (yc - H / 2) * -Math.cos(angle) };
  }
  return { angle: Math.atan2(H, -0.24 * W), offset: 0 };
}

export function normal(s: Seam): Pt {
  return { x: Math.sin(s.angle), y: -Math.cos(s.angle) };
}

export function anchor(W: number, H: number, s: Seam): Pt {
  const n = normal(s);
  return { x: W / 2 + s.offset * n.x, y: H / 2 + s.offset * n.y };
}

export function side(W: number, H: number, s: Seam, p: Pt): number {
  const n = normal(s);
  const P = anchor(W, H, s);
  return (p.x - P.x) * n.x + (p.y - P.y) * n.y;
}

/** Clip the viewport rect to the terminal half-plane. Returns the polygon and the seam's visible segment. */
export function clip(W: number, H: number, s: Seam): { poly: Pt[]; seg: Pt[] } {
  const rect: Pt[] = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ];
  const d = (p: Pt) => side(W, H, s, p);
  const poly: Pt[] = [];
  const seg: Pt[] = [];
  for (let i = 0; i < rect.length; i++) {
    const a = rect[i];
    const b = rect[(i + 1) % rect.length];
    const da = d(a);
    const db = d(b);
    if (da >= 0) poly.push(a);
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db);
      const q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      poly.push(q);
      seg.push(q);
    }
  }
  return { poly, seg };
}

export function polygonCss(poly: Pt[]): string {
  if (poly.length < 3) return "polygon(0 0, 0 0, 0 0)";
  return `polygon(${poly.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(", ")})`;
}

export function centroid(poly: Pt[]): Pt {
  if (!poly.length) return { x: 0, y: 0 };
  const sx = poly.reduce((a, p) => a + p.x, 0);
  const sy = poly.reduce((a, p) => a + p.y, 0);
  return { x: sx / poly.length, y: sy / poly.length };
}

/** x where the seam crosses a given y (desktop layout helper). */
export function seamXAt(W: number, H: number, s: Seam, y: number): number {
  const P = anchor(W, H, s);
  const dx = Math.cos(s.angle);
  const dy = Math.sin(s.angle);
  if (Math.abs(dy) < 1e-6) return P.x;
  return P.x + ((y - P.y) * dx) / dy;
}

export type WinId = "w404" | "whoami" | "trace" | "nav" | "shell" | "cipher" | "leak" | "flash" | "validator";

export type Layout = {
  mobile: boolean;
  wins: Partial<Record<WinId, Rect>>;
  behindKey: Pt;
  otherSideKey: Pt;
  morseStar: Pt;
};

const WIDGET_SIZE: Record<"cipher" | "leak" | "flash" | "validator", { w: number; h: number }> = {
  cipher: { w: 300, h: 360 },
  leak: { w: 470, h: 430 },
  flash: { w: 380, h: 200 },
  validator: { w: 470, h: 360 },
};

export function layout(W: number, H: number): Layout {
  const s = defaultSeam(W, H);
  if (W < MOBILE_BP) {
    const { w404, shell, yc, drop } = mobileGeom(W, H);
    return {
      mobile: true,
      wins: { w404, shell },
      behindKey: { x: w404.x + w404.w / 2, y: w404.y + w404.h / 2 },
      otherSideKey: { x: W * 0.36, y: (yc + shell.y) / 2 + 4 },
      morseStar: { x: W - 30, y: yc + drop / 2 - 20 },
    };
  }
  const w404 = { x: Math.max(24, W * 0.05), y: 104, w: Math.min(440, W * 0.36), h: 248 };
  const whoami = { x: Math.max(24, W * 0.05), y: H - 222 - 32, w: 300, h: 222 };
  const ty = H * 0.6;
  const trace = { x: seamXAt(W, H, s, ty) - 170, y: ty - 75, w: 340, h: 150 };
  const nav = { x: W - 250 - 36, y: 96, w: 250, h: 178 };
  const sw = Math.min(540, Math.max(400, W * 0.36));
  const sh = Math.min(400, H - 300);
  const shell = { x: W - sw - 28, y: H - sh - 28, w: sw, h: sh };
  return {
    mobile: false,
    wins: { w404, whoami, trace, nav, shell },
    behindKey: { x: w404.x + w404.w / 2, y: w404.y + w404.h / 2 },
    otherSideKey: { x: W * 0.66, y: H * 0.34 },
    morseStar: { x: Math.max(40, W * 0.06), y: H * 0.52 },
  };
}

/** Level widgets open centered in the terminal half, clamped to the viewport. */
export function widgetRect(W: number, H: number, s: Seam, id: keyof typeof WIDGET_SIZE): Rect {
  const size = WIDGET_SIZE[id];
  if (W < MOBILE_BP) {
    // under the default seam (the player may have dragged it anywhere by now),
    // leaving the shell's input row and tap bar at the bottom uncovered
    const seamLow = Math.max(...clip(W, H, defaultSeam(W, H)).seg.map((p) => p.y), H / 2);
    const y = Math.round(seamLow + 8);
    const bottomBar = id === "flash" ? 200 : 100;
    return { x: 10, y, w: W - 20, h: Math.max(140, Math.min(size.h, H - bottomBar - y)) };
  }
  const w = Math.min(size.w, W - 24);
  const h = Math.min(size.h, H - 24);
  const c = centroid(clip(W, H, s).poly);
  return {
    x: Math.min(Math.max(12, c.x - w / 2), W - w - 12),
    y: Math.min(Math.max(12, c.y - h / 2), H - h - 12),
    w,
    h,
  };
}
