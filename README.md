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
| `lock` | Optional romantic "enter your nickname" gate shown before the page (see below) |
| `hero` | The full-screen intro section |
| `sections` | An ordered array of content sections rendered below the hero |
| `footer.text` | Small text shown at the very bottom |

### Lock screen

Set `lock.enabled` to `true` to require a fun "password" before the page is revealed — perfect for asking "what do you call me?" and only accepting the pet name she calls you.

```json
"lock": {
  "enabled": true,
  "emoji": "💌",
  "question": "Before you come in... what do you call me? 🥺",
  "subtitle": "Hint: it's the name only you use for me 💕",
  "placeholder": "Type it here...",
  "buttonText": "Unlock My Surprise 🔓",
  "answers": ["pookie", "jaanu"],
  "hint": "Try again, jaanu... think about what you whisper to me 😉"
}
```

`answers` accepts multiple valid nicknames (case-insensitive, whitespace-trimmed). The hint appears after a wrong guess. Set `enabled` to `false` to skip the gate entirely.

> **Note:** None of the gates below are remembered across page loads — every refresh shows the lock screen (and any other enabled gates) again, so the surprise stays fresh each time.

### Heart gate

Set `heartGate.enabled` to `true` to show a locked heart right after the lock screen. Scrolling is disabled until it's tapped. Tapping it bursts into floating hearts/sparkles, reveals `unlockedMessage`, and switches the custom cursor to `cursorEmoji` for the rest of the visit.

```json
"heartGate": {
  "enabled": true,
  "title": "There's something locked just for you...",
  "subtitle": "Tap the heart to set it free 💗",
  "unlockedMessage": "There you go... now scroll down and let this melt your heart 💕",
  "cursorEmoji": "💖"
}
```

Set `enabled` to `false` to skip it.

### Scroll lock (mid-page checkpoint)

Set `scrollLock.enabled` to `true` to show a second nickname lock once the visitor has scrolled past `triggerPercent` of the page (e.g. `0.5` = halfway). Scrolling is paused until the nickname is entered again. It uses the same fields as the lock screen.

```json
"scrollLock": {
  "enabled": true,
  "triggerPercent": 0.5,
  "emoji": "🔐",
  "question": "Wait... one more time, just to be sure 🥺",
  "subtitle": "What do you call me again?",
  "placeholder": "Type it here...",
  "buttonText": "Yes, it's me 💕",
  "answers": ["pookie"],
  "hint": "Hehe, try again jaanu 😉"
}
```

Set `enabled` to `false` to skip it.

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

### "Ask My Heart" chatbot widget

Set `chatbot.enabled` to `true` to add a floating chat bubble (bottom-right) once the page is unlocked. It's a "fake AI" — there's no real model behind it, just a fixed set of `questions`/`answers` pairs you write in the JSON. Tapping a question shows a fun "digging through his heart" loader (cycling through `loadingMessages`) for `loadingDuration` ms before revealing the matching `answer`.

```json
"chatbot": {
  "enabled": true,
  "buttonEmoji": "🤖",
  "title": "Ask My Heart",
  "subtitle": "An AI that only knows how to talk about you",
  "greeting": "Hii! Pick a question and I'll dig through his heart for the real answer 💕",
  "loadingDuration": 1800,
  "loadingMessages": [
    "Digging through his heart...",
    "Searching for the right feelings..."
  ],
  "questions": [
    { "question": "Do you love me?", "answer": "More than words can ever say... ❤️" }
  ]
}
```

Set `enabled` to `false` to hide the widget entirely.

## Tech stack

- [Vite](https://vite.dev/) + React 19
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Motion](https://motion.dev/) for animations (scroll reveals, floating decorations, spring effects)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) for the surprise confetti burst
