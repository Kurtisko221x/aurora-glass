import { blobLayout, hexToRgba, type Config } from "./config";

export type CodeTab = "css" | "tailwind" | "react";

function glassDecl(c: Config) {
  return [
    `background: ${hexToRgba(c.tint, c.tintOpacity)};`,
    `backdrop-filter: blur(${c.glassBlur}px) saturate(${c.saturation}%);`,
    `-webkit-backdrop-filter: blur(${c.glassBlur}px) saturate(${c.saturation}%);`,
    `border: 1px solid ${hexToRgba("#ffffff", c.borderOpacity)};`,
    `border-radius: ${c.radius}px;`,
    `box-shadow: 0 24px 64px ${hexToRgba("#000000", c.shadow)};`,
  ];
}

function blobCss(c: Config) {
  return c.colors
    .map((color, i) => {
      const b = blobLayout(i);
      return `.aurora__blob:nth-child(${i + 1}) {
  background: ${color};
  left: ${b.x}%;
  top: ${b.y}%;
  --dx: ${b.dx}vw;
  --dy: ${b.dy}vh;
  animation-delay: ${b.delay}s;
}`;
    })
    .join("\n");
}

export function generateCss(c: Config) {
  return `/* aurora background */
.aurora {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: ${c.background};
  z-index: -1;
}
.aurora__blob {
  position: absolute;
  width: ${c.blobSize}vmax;
  height: ${c.blobSize}vmax;
  border-radius: 50%;
  filter: blur(${c.blur}px);
  opacity: ${c.intensity};
  mix-blend-mode: screen;
  translate: -50% -50%;
  animation: aurora-drift ${c.speed}s ease-in-out infinite alternate;
}
${blobCss(c)}
@keyframes aurora-drift {
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
  50%  { transform: translate(var(--dx), calc(var(--dy) * -1)) scale(1.2) rotate(60deg); }
  100% { transform: translate(calc(var(--dx) * -0.6), var(--dy)) scale(0.9) rotate(-30deg); }
}
@media (prefers-reduced-motion: reduce) {
  .aurora__blob { animation: none; }
}

/* glass card */
.glass {
  ${glassDecl(c).join("\n  ")}
}

/* markup:
<div class="aurora">${c.colors.map(() => '\n  <span class="aurora__blob"></span>').join("")}
</div>
<div class="glass">…</div>
*/`;
}

export function generateTailwind(c: Config) {
  const bg = hexToRgba(c.tint, c.tintOpacity).replace(/ /g, "");
  const border = hexToRgba("#ffffff", c.borderOpacity).replace(/ /g, "");
  const shadow = hexToRgba("#000000", c.shadow).replace(/ /g, "");
  return `{/* glass card — Tailwind v4 arbitrary values */}
<div className="bg-[${bg}] backdrop-blur-[${c.glassBlur}px] backdrop-saturate-[${c.saturation}%] border border-[${border}] rounded-[${c.radius}px] shadow-[0_24px_64px_${shadow}] p-8">
  …
</div>

{/* aurora — keep the @keyframes + .aurora__blob rules from the CSS tab */}
<div className="fixed inset-0 -z-10 overflow-hidden bg-[${c.background}]">
${c.colors.map(() => `  <span className="aurora__blob" />`).join("\n")}
</div>`;
}

export function generateReact(c: Config) {
  const blobs = c.colors.map((color, i) => {
    const b = blobLayout(i);
    return `  { color: "${color}", x: ${b.x}, y: ${b.y}, dx: ${b.dx}, dy: ${b.dy}, delay: ${b.delay} },`;
  });
  return `// AuroraGlass.tsx — drop-in, zero dependencies
const BLOBS = [
${blobs.join("\n")}
];

const KEYFRAMES = \`@keyframes aurora-drift {
  0% { transform: translate(0,0) scale(1) rotate(0deg) }
  50% { transform: translate(var(--dx), calc(var(--dy) * -1)) scale(1.2) rotate(60deg) }
  100% { transform: translate(calc(var(--dx) * -0.6), var(--dy)) scale(.9) rotate(-30deg) }
}\`;

export function Aurora() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "${c.background}", zIndex: -1 }}>
      <style>{KEYFRAMES}</style>
      {BLOBS.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute", left: \`\${b.x}%\`, top: \`\${b.y}%\`, translate: "-50% -50%",
            width: "${c.blobSize}vmax", height: "${c.blobSize}vmax", borderRadius: "50%",
            background: b.color, filter: "blur(${c.blur}px)", opacity: ${c.intensity}, mixBlendMode: "screen",
            animation: "aurora-drift ${c.speed}s ease-in-out infinite alternate",
            animationDelay: \`\${b.delay}s\`,
            ["--dx" as string]: \`\${b.dx}vw\`, ["--dy" as string]: \`\${b.dy}vh\`,
          }}
        />
      ))}
    </div>
  );
}

export function Glass({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "${hexToRgba(c.tint, c.tintOpacity)}",
        backdropFilter: "blur(${c.glassBlur}px) saturate(${c.saturation}%)",
        WebkitBackdropFilter: "blur(${c.glassBlur}px) saturate(${c.saturation}%)",
        border: "1px solid ${hexToRgba("#ffffff", c.borderOpacity)}",
        borderRadius: ${c.radius},
        boxShadow: "0 24px 64px ${hexToRgba("#000000", c.shadow)}",
        padding: 32,
      }}
    >
      {children}
    </div>
  );
}`;
}

export const generators: Record<CodeTab, (c: Config) => string> = {
  css: generateCss,
  tailwind: generateTailwind,
  react: generateReact,
};
