import { useEffect, useMemo, useState } from "react";
import { generators, type CodeTab } from "./codegen";
import { blobLayout, decodeConfig, encodeConfig, hexToRgba, PRESETS, randomConfig, type Config } from "./config";

function Slider(props: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>{props.label}</span>
        <span className="font-mono text-white/90">
          {props.value}
          {props.unit}
        </span>
      </div>
      <input
        type="range"
        className="w-full accent-fuchsia-400"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-300/80">{title}</h3>
      {children}
    </section>
  );
}

export function App() {
  const [cfg, setCfg] = useState<Config>(() => decodeConfig(location.hash.slice(1)) ?? PRESETS.synthwave);
  const [tab, setTab] = useState<CodeTab>("css");
  const [copied, setCopied] = useState<string | null>(null);

  const set = <K extends keyof Config>(key: K, value: Config[K]) => setCfg((c) => ({ ...c, [key]: value }));
  const code = useMemo(() => generators[tab](cfg), [cfg, tab]);

  useEffect(() => {
    history.replaceState(null, "", `#${encodeConfig(cfg)}`);
  }, [cfg]);

  async function copy(text: string, what: string) {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  }

  const glassStyle: React.CSSProperties = {
    background: hexToRgba(cfg.tint, cfg.tintOpacity),
    backdropFilter: `blur(${cfg.glassBlur}px) saturate(${cfg.saturation}%)`,
    WebkitBackdropFilter: `blur(${cfg.glassBlur}px) saturate(${cfg.saturation}%)`,
    border: `1px solid ${hexToRgba("#ffffff", cfg.borderOpacity)}`,
    borderRadius: cfg.radius,
    boxShadow: `0 24px 64px ${hexToRgba("#000000", cfg.shadow)}`,
  };

  return (
    <div className="min-h-screen bg-[#0a0814] text-white lg:grid lg:grid-cols-[320px_1fr]">
      {/* controls */}
      <aside className="border-b lg:border-b-0 lg:border-r border-white/10 p-5 space-y-7 lg:h-screen lg:overflow-y-auto">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            aurora<span className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">glass</span> 🔮
          </h1>
          <p className="text-xs text-white/50 mt-1">glassmorphism & aurora generator</p>
        </div>

        <Section title="presets">
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((name) => (
              <button key={name} onClick={() => setCfg(PRESETS[name])} className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/15 border border-white/10 capitalize">
                {name}
              </button>
            ))}
            <button onClick={() => setCfg(randomConfig())} className="px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-fuchsia-500 to-violet-500 font-semibold">
              🎲 random
            </button>
          </div>
        </Section>

        <Section title="aurora">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="relative">
              <input type="color" value={cfg.background} onChange={(e) => set("background", e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer bg-transparent" />
              <span className="sr-only">background</span>
            </label>
            <span className="text-white/30">|</span>
            {cfg.colors.map((col, i) => (
              <div key={i} className="relative group">
                <input
                  type="color"
                  value={col}
                  onChange={(e) => set("colors", cfg.colors.map((c, j) => (j === i ? e.target.value : c)))}
                  className="w-9 h-9 rounded-full cursor-pointer bg-transparent"
                />
                {cfg.colors.length > 2 && (
                  <button
                    onClick={() => set("colors", cfg.colors.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-[10px] leading-none hidden group-hover:block"
                    aria-label="remove color"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {cfg.colors.length < 5 && (
              <button onClick={() => set("colors", [...cfg.colors, "#00d4ff"])} className="w-9 h-9 rounded-full border border-dashed border-white/30 text-white/60" aria-label="add color">
                +
              </button>
            )}
          </div>
          <Slider label="blob size" value={cfg.blobSize} min={20} max={90} unit="vmax" onChange={(v) => set("blobSize", v)} />
          <Slider label="blur" value={cfg.blur} min={20} max={160} unit="px" onChange={(v) => set("blur", v)} />
          <Slider label="loop duration" value={cfg.speed} min={4} max={40} unit="s" onChange={(v) => set("speed", v)} />
          <Slider label="intensity" value={cfg.intensity} min={0.1} max={1} step={0.05} onChange={(v) => set("intensity", v)} />
        </Section>

        <Section title="glass">
          <div className="flex items-center gap-3 text-xs text-white/60">
            <input type="color" value={cfg.tint} onChange={(e) => set("tint", e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer bg-transparent" />
            tint color
          </div>
          <Slider label="tint opacity" value={cfg.tintOpacity} min={0} max={0.6} step={0.01} onChange={(v) => set("tintOpacity", v)} />
          <Slider label="backdrop blur" value={cfg.glassBlur} min={0} max={48} unit="px" onChange={(v) => set("glassBlur", v)} />
          <Slider label="saturation" value={cfg.saturation} min={50} max={250} unit="%" onChange={(v) => set("saturation", v)} />
          <Slider label="border" value={cfg.borderOpacity} min={0} max={1} step={0.01} onChange={(v) => set("borderOpacity", v)} />
          <Slider label="radius" value={cfg.radius} min={0} max={60} unit="px" onChange={(v) => set("radius", v)} />
          <Slider label="shadow" value={cfg.shadow} min={0} max={1} step={0.01} onChange={(v) => set("shadow", v)} />
        </Section>

        <button onClick={() => copy(location.href, "link")} className="w-full py-2.5 rounded-xl border border-white/15 text-sm hover:bg-white/5">
          {copied === "link" ? "link copied ✓" : "🔗 copy share link"}
        </button>
      </aside>

      {/* preview + code */}
      <main className="p-4 lg:p-6 space-y-4 lg:h-screen lg:overflow-y-auto">
        <div className="relative h-[460px] rounded-3xl overflow-hidden" style={{ background: cfg.background }}>
          {cfg.colors.map((color, i) => {
            const b = blobLayout(i);
            return (
              <span
                key={i}
                className="aurora-blob"
                style={
                  {
                    background: color,
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${cfg.blobSize}vmax`,
                    height: `${cfg.blobSize}vmax`,
                    filter: `blur(${cfg.blur}px)`,
                    opacity: cfg.intensity,
                    animationDuration: `${cfg.speed}s`,
                    animationDelay: `${b.delay}s`,
                    "--dx": `${b.dx}vw`,
                    "--dy": `${b.dy}vh`,
                  } as React.CSSProperties
                }
              />
            );
          })}
          <div className="absolute inset-0 grid place-items-center p-6">
            <div style={glassStyle} className="w-full max-w-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full bg-white/30" />
                <div>
                  <div className="font-semibold">vibe card</div>
                  <div className="text-xs opacity-60">frosted & glowing</div>
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight mb-2">$ 4,269.00</div>
              <div className="text-sm opacity-70 mb-6">Your glass looks great on this aurora ✨</div>
              <div className="flex gap-2">
                <div className="flex-1 py-2.5 rounded-xl bg-white/90 text-black text-center text-sm font-semibold">Primary</div>
                <div className="flex-1 py-2.5 rounded-xl border border-white/30 text-center text-sm">Ghost</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden">
          <div className="flex items-center gap-1 p-2 border-b border-white/10">
            {(["css", "tailwind", "react"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm ${tab === t ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}>
                {t === "css" ? "CSS" : t === "tailwind" ? "Tailwind" : "React"}
              </button>
            ))}
            <button onClick={() => copy(code, "code")} className="ml-auto px-4 py-1.5 rounded-lg text-sm bg-gradient-to-r from-fuchsia-500 to-violet-500 font-semibold">
              {copied === "code" ? "copied ✓" : "copy"}
            </button>
          </div>
          <pre className="p-5 text-[13px] leading-relaxed font-mono text-fuchsia-100/90 overflow-auto max-h-[420px]">
            <code>{code}</code>
          </pre>
        </div>
      </main>
    </div>
  );
}
