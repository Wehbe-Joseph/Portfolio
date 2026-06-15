# Joseph Wehbe — Portfolio

A minimal, motion-led portfolio for motion designer **Joseph Wehbe**. Built with vanilla HTML/CSS/JS and powered by [Lenis](https://github.com/studio-freight/lenis) (smooth scroll) + [GSAP](https://gsap.com/) (animations). Inspired by the clean, animation-first feel of studio sites.

## Features
- Animated loader with percentage counter
- Inertia smooth scrolling (Lenis)
- Custom cursor with hover/"View" states
- Hero with staggered text reveals
- Selected work list with cursor-following image previews
- Scroll-triggered reveals, parallax and a running marquee
- Fully responsive (cursor/preview disable on touch devices)

## Run locally
No build step. Just serve the folder (needed so the browser can load the JS/assets):

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

## Adding your projects
Open `js/main.js` and edit the `projects` array at the top. Each entry:

```js
{
  title: "Project Name",            // big title
  client: "Client / context",       // small label next to the title
  category: "Brand Film",           // right-hand category
  year: "2025",
  image: "assets/projects/01.jpg",  // preview image (16:12 works well)
  link: "https://vimeo.com/..."     // link to the project/video
}
```

The list re-renders automatically — add or remove entries freely. Drop your preview
images (or video posters) into `assets/projects/`.

> Currently there are 9 placeholder entries ready for your videos.

## Customizing
- **Colors / fonts:** CSS variables at the top of `css/style.css` (`--bg`, `--fg`, `--accent`, fonts).
- **Copy:** edit text directly in `index.html` (hero, about, contact, social links).
- **Email & socials:** update the `mailto:` and social `href`s in the footer of `index.html`.

## Structure
```
portfolio/
├── index.html
├── css/style.css
├── js/main.js
└── assets/projects/placeholder.svg
```
