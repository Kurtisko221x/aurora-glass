<div align="center">

# 🔮 aurora glass

**Design glassmorphism cards on animated aurora backgrounds — then copy clean CSS, Tailwind or React.**

### [▶ Open the editor](https://kurtisko221x.github.io/aurora-glass/)

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react"/>
<img src="https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/zero_runtime_deps-e100ff?style=for-the-badge"/>

</div>

---

## Features

- 🌌 **Aurora editor** — 2–5 colors, blob size, blur, loop speed, intensity, background
- 🧊 **Glass editor** — tint + opacity, backdrop blur, saturation, border, radius, shadow
- 👀 **Live preview** — a real glass card floating over the animated aurora
- 📋 **Export** as plain **CSS**, **Tailwind v4** classes or a drop-in **React** component (no dependencies)
- 🎨 **Presets** — synthwave, northern lights, sunset, mint — plus a 🎲 random generator
- 🔗 **Shareable links** — the whole design lives in the URL hash
- ♿ exported CSS respects `prefers-reduced-motion`

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`
(enable it once in **Settings → Pages → Source: GitHub Actions**).

## How the aurora works

Each color is a huge blurred circle with `mix-blend-mode: screen`. They drift on a shared `@keyframes`
path, offset per blob with CSS variables (`--dx`, `--dy`) and negative `animation-delay`, so the motion
never looks synchronized — and it's pure CSS, so it runs on the compositor.

## License

MIT
