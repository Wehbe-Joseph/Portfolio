# Joseph Wehbe — Portfolio

A minimal, cinematic portfolio for **Joseph Wehbe**, who creates cinematic AI walkthroughs of unbuilt real estate projects — helping developers raise investment, pre-sell units, and market properties before construction. Built with vanilla HTML/CSS/JS and powered by [Lenis](https://github.com/studio-freight/lenis) (smooth scroll) + [GSAP](https://gsap.com/) (animations).

## Features
- Animated loader with percentage counter
- Interactive flowing flow-field background that reacts to the cursor
- Inertia smooth scrolling (Lenis)
- Custom cursor with hover/"View" states
- Pinned hero that zooms/dissolves into the projects grid on scroll
- Video project cards: silent preview on hover, popup player (with sound) on click
- "Under NDA" locked cards for protected work
- Fully responsive (cursor/preview effects disable on touch devices)

## Run locally
No build step. Serve the folder (so the browser can load the assets and stream video):

```bash
node serve.js
# then open http://localhost:8000
```

## Adding / changing videos
Edit **`projects.js`** (it has step-by-step instructions inside). Each entry:

```js
{
  title: "Project Name",
  client: "Developer / location · 2025",
  video: "assets/projects/video1.mp4",   // your mp4 in assets/projects/
  poster: "",                            // optional still; blank = use first frame
}
```

For protected work you can't show publicly, add `locked: true` (no video needed) and the
card renders blurred with an "UNDER NDA" badge.

## Customizing copy & style
- **Copy:** edit text directly in `index.html` (hero title, subtitle, tagline, about, outcomes, footer).
- **Colors / fonts:** CSS variables at the top of `css/style.css` (`--bg`, `--fg`, `--accent`).
- **Contact:** update the `mailto:` and `wa.me` links in the header and footer of `index.html`.

## Deploy (Vercel)
Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). Framework
preset: **Other** (static site, no build step). Every `git push` auto-redeploys.

## Structure
```
portfolio/
├── index.html        # markup + copy
├── css/style.css     # styling
├── js/main.js        # animations, flow field, video lightbox
├── projects.js       # YOUR videos (edit this)
├── serve.js          # local dev server (video-aware)
└── assets/projects/  # video files + placeholder
```
