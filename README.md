# Marina Mikhael — Multi-page Website

A premium, responsive multi-page website for **Marina Mikhael, Marketing Strategist**.

The visual identity is derived from the `Marina_Zarif_Brand_Identity.pdf` in this folder, with final palette and styling aligned to `marina-mikheal-website(1).html`:

- **Palette** — Magenta `#b41a58` · Magenta-Deep `#8c1345` · Gold `#fdc032` · Soft Pink `#f7d9e4` · Onyx `#2b1420` · Ivory `#faf7f5`
- **Typography** — Poppins (display) · Inter (body)
- **Tone** — Refined, considered, brand-concierge, confident

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, about preview, services preview (3 of 5), final CTA |
| `about.html` | Full bio, "Why Work With Me" grid, education & background, AI research |
| `services.html` | All 5 services + 4-step "How I Work" process |
| `contact.html` | Contact info + working contact form + FAQ accordion |
| `404.html` | Branded not-found page |

## Files

```
index.html      Home
about.html      About
services.html   Services
contact.html    Contact
404.html        Not-found
index.css       design system & all styles
js/main.js      sticky nav, mobile menu, smooth scroll, reveal, active-link, form, FAQ
assets/         Marina's portrait photography (JPG)
termx-backup/   the previous TermX project, kept for reference
```

## Features

- **Active-link highlighting** — the current page is automatically bolded + underlined in the nav (handled in `js/main.js`)
- **Sticky WhatsApp button** — appears on every page, bottom-right
- **Mobile menu** — slide-in drawer with scrim, keyboard-accessible (Escape to close)
- **Reveal-on-scroll** — sections fade up as they enter the viewport (respects `prefers-reduced-motion`)
- **Contact form** — submits by opening the user's email client with all fields pre-filled (mailto fallback for static hosting)
- **FAQ accordion** — native `<details>` elements styled to match the brand (no JS required for the open/close)
- **404 page** — `404.html` is served for any missing route

## Customise

### Edit colours

All colours live as CSS custom properties at the top of `index.css` (see the `:root` block). Change a token and the entire system updates automatically.

### Edit copy

Each page is a standalone HTML file — open it in any editor and change the text directly. The contact form `mailto:` destination is hard-coded in `js/main.js` (search for `marina.mikhael2026@hotmail.com`).

### Wire the contact form to a real backend

The current contact form opens the user's email client. To send real submissions, swap the `mailto:` logic in `js/main.js` for a fetch POST to a service like Formspree, Netlify Forms, or your own endpoint. Look for `window.location.href = mailto;` and replace.

## Run

No build step. Open `index.html` directly in a browser, or serve the folder:

```bash
# from this directory
python -m http.server 8000
# then visit http://localhost:8000
```

For full multi-page nav testing (active-link highlighting, 404 fallback), serving over HTTP is recommended.

## Restore the previous project

The original TermX terminal files were preserved in `termx-backup/`. To restore:

```bash
# from this directory (PowerShell)
Move-Item index.html termx-backup/index.new.html
Move-Item index.css termx-backup/index.new.css
Move-Item js termx-backup/js.new
Copy-Item termx-backup/index.html .
Copy-Item termx-backup/index.css .
Copy-Item termx-backup/js .
```
