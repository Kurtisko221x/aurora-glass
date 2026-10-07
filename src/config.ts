export interface Config {
  // aurora
  background: string;
  colors: string[];
  blobSize: number; // vmax
  blur: number; // px
  speed: number; // seconds per loop
  intensity: number; // 0-1
  // glass
  glassBlur: number; // px
  tint: string;
  tintOpacity: number; // 0-1
  saturation: number; // %
  borderOpacity: number; // 0-1
  radius: number; // px
  shadow: number; // 0-1
}

export const PRESETS: Record<string, Config> = {
  synthwave: {
    background: "#07051a",
    colors: ["#7f00ff", "#e100ff", "#ff6ec7", "#00d4ff"],
    blobSize: 55, blur: 80, speed: 18, intensity: 0.7,
    glassBlur: 20, tint: "#ffffff", tintOpacity: 0.08, saturation: 160, borderOpacity: 0.18, radius: 28, shadow: 0.45,
  },
  "northern lights": {
    background: "#020b14",
    colors: ["#00ffa3", "#00b4d8", "#7b2cbf"],
    blobSize: 65, blur: 100, speed: 26, intensity: 0.6,
    glassBlur: 24, tint: "#e0fbff", tintOpacity: 0.06, saturation: 140, borderOpacity: 0.15, radius: 24, shadow: 0.5,
  },
  sunset: {
    background: "#1a0612",
    colors: ["#ff9a00", "#ff2e88", "#ffd166", "#7f00ff"],
    blobSize: 50, blur: 70, speed: 14, intensity: 0.75,
    glassBlur: 16, tint: "#fff4e6", tintOpacity: 0.12, saturation: 130, borderOpacity: 0.25, radius: 32, shadow: 0.35,
  },
  mint: {
    background: "#eefcf6",
    colors: ["#4ade80", "#a7f3d0", "#67e8f9"],
    blobSize: 60, blur: 90, speed: 22, intensity: 0.8,
    glassBlur: 18, tint: "#ffffff", tintOpacity: 0.4, saturation: 120, borderOpacity: 0.6, radius: 20, shadow: 0.12,
  },
};

const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
const randHex = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

export function randomConfig(): Config {
  const hue = rand(0, 360);
  const colors = Array.from({ length: rand(3, 5) }, (_, i) => hslToHex((hue + i * rand(25, 70)) % 360, rand(70, 100), rand(50, 65)));
  return {
    background: hslToHex(hue, 60, rand(3, 9)),
    colors,
    blobSize: rand(40, 70), blur: rand(60, 120), speed: rand(10, 30), intensity: rand(50, 85) / 100,
    glassBlur: rand(10, 30), tint: Math.random() > 0.5 ? "#ffffff" : randHex(), tintOpacity: rand(4, 18) / 100,
    saturation: rand(100, 180), borderOpacity: rand(10, 30) / 100, radius: rand(12, 36), shadow: rand(20, 55) / 100,
  };
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${+alpha.toFixed(2)})`;
}

/** Shareable state in the URL hash. */
export function encodeConfig(c: Config) {
  return btoa(JSON.stringify(c));
}
export function decodeConfig(hash: string): Config | null {
  try {
    const c = JSON.parse(atob(hash)) as Config;
    return Array.isArray(c.colors) && typeof c.background === "string" ? c : null;
  } catch {
    return null;
  }
}

/** Deterministic blob placement/paths, shared by the preview and the generated code. */
export function blobLayout(i: number) {
  const pts = [
    [10, 15], [65, 10], [20, 60], [70, 55], [40, 35],
  ];
  const [x, y] = pts[i % pts.length];
  return { x, y, dx: i % 2 ? -18 : 22, dy: i % 3 ? 16 : -20, delay: -(i * 3.7) };
}
