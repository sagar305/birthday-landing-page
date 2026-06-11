# Birthday Surprise Landing Page 🎉

An animated, scroll-driven birthday landing page built with **React**, **Vite**, **Tailwind CSS**, and **Motion** (Framer Motion successor). The entire page — text, photos, colors, and sections — is driven by a single external JSON file, so you can create a new surprise for anyone without touching the code.

## Getting started

```bash
npm install
npm run dev
```

## Customizing the page

All content lives in [`public/config.json`](./public/config.json). It is fetched at runtime, so you can edit it (or replace it on a deployed server) without rebuilding the app.

### Top-level fields

| Field | Description |
| --- | --- |
| `siteTitle` | Browser tab title |
| `theme.background` | CSS `background` value for the whole page (gradient, color, etc.) |
| `hero` | The full-screen intro section |
| `sections` | An ordered array of content sections rendered below the hero |
| `footer.text` | Small text shown at the very bottom |

### Hero

```json
"hero": {
  "eyebrow": "A Very Special Day For",
  "heading": "Happy Birthday, Riya!",
  "subheading": "...",
  "image": "https://...jpg",
  "ctaText": "Scroll down for a surprise"
}
```

### Sections

Each entry in `sections` needs a unique `id` and a `type`. Supported types:

- **`gallery`** – animated photo grid (`title`, `subtitle`, `items: [{ image, caption }]`)
- **`reasons`** – grid of icon + text cards (`title`, `subtitle`, `items: [{ icon, text }]`)
- **`timeline`** – vertical scroll-animated timeline of photos with alternating left/right cards (`title`, `subtitle`, `items: [{ date, image, caption }]`)
- **`puzzle`** – a "How Much I Love You" jigsaw: photo pieces fly together on scroll, followed by an animated love meter that fills to 100% and then reveals a custom message (`title`, `subtitle`, `image`, `meterLabel`, `revealText`)
- **`message`** – a love-letter style note (`title`, `body` — use `\n` for paragraph breaks, `signature`)
- **`wishes`** – a sliding carousel of messages from friends/family, one at a time with autoplay, arrows, and dots (`title`, `subtitle`, `items: [{ name, avatar, message }]`)
- **`voicenote`** – an animated audio/video player for a personal voice or video message (`title`, `subtitle`, `audio: { url, label }`, `video: { url, label }`). Leave `audio.url`/`video.url` empty to omit either one.
- **`surprise`** – a button that triggers a confetti burst and reveals a hidden message (`title`, `subtitle`, `buttonText`, `revealHeading`, `revealMessage`, `revealImage`)

Sections are rendered in the order they appear in the array, so you can reorder, remove, or duplicate them freely.

## Tech stack

- [Vite](https://vite.dev/) + React 19
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Motion](https://motion.dev/) for animations (scroll reveals, floating decorations, spring effects)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) for the surprise confetti burst
