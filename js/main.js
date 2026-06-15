/* =========================================================
   Joseph Wehbe — Portfolio
   main.js
   ---------------------------------------------------------
   HOW TO ADD A PROJECT LATER:
   Edit the `projects` array below. Each project:
   {
     title: "Project Name",
     sub:   "Client / context",
     image: "assets/projects/01.jpg",   // thumbnail
     link:  "https://vimeo.com/..."      // where the video lives
   }
   The grid re-renders automatically and numbers itself.
   ========================================================= */

/* Projects are defined in /projects.js (window.PROJECTS) so they are
   easy to edit without touching this file. Fallback below just in case. */
const CONTACT_EMAIL = "josephjwehbe@gmail.com";
const projects = (window.PROJECTS && window.PROJECTS.length) ? window.PROJECTS : [
  { title: "Project One", client: "Coming soon", image: "assets/projects/placeholder.svg", link: "#" },
];

/* =========================================================
   Perlin noise (Ken Perlin's improved noise, 2D/3D)
   ========================================================= */
const Perlin = (() => {
  const p = new Uint8Array(512);
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (h, x, y, z) => {
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  return {
    noise(x, y, z) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z);
      const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
      const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
      return lerp(
        lerp(lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
             lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u), v),
        lerp(lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
             lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u), v), w);
    }
  };
})();

/* =========================================================
   Flowing background — flow-field particle trails
   ========================================================= */
function initFlow() {
  const canvas = document.querySelector("[data-flow]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const palette = ["#6b53a6", "#8f7bd0", "#4fa6a0", "#b9c87e", "#d7d3c6", "#3f6f8f", "#a45f8f", "#cfcad6"];

  let w, h, dpr, particles = [];
  const COUNT = window.matchMedia("(max-width: 768px)").matches ? 360 : 820;
  const SCALE = 0.0016;     // noise frequency
  let z = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, w, h);
  }
  resize();
  window.addEventListener("resize", resize);

  function spawn() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      life: 0,
      maxLife: 180 + Math.random() * 320,
      speed: (0.6 + Math.random() * 1.2) * dpr,
      color: palette[(Math.random() * palette.length) | 0],
      width: (0.5 + Math.random() * 1.1) * dpr,
    };
  }
  for (let i = 0; i < COUNT; i++) particles.push(spawn());

  // intensity is driven by scroll (1 = full hero, ~0.18 once in projects)
  let intensity = 1;
  window.__setFlowIntensity = (v) => { intensity = v; };

  /* --- cursor interaction --- */
  const RADIUS = (window.matchMedia("(max-width: 768px)").matches ? 150 : 240); // px (css)
  const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, active: false, vx: 0, vy: 0 };
  function setMouse(e) {
    const x = e.clientX, y = e.clientY;
    mouse.vx = x - (mouse.active ? mouse.x : x);
    mouse.vy = y - (mouse.active ? mouse.y : y);
    mouse.x = x; mouse.y = y; mouse.active = true;
  }
  window.addEventListener("mousemove", setMouse, { passive: true });
  window.addEventListener("mouseout", () => { mouse.active = false; });
  window.addEventListener("touchmove", (e) => {
    if (e.touches[0]) setMouse(e.touches[0]);
  }, { passive: true });
  window.addEventListener("touchend", () => { mouse.active = false; });

  const radiusDev = () => RADIUS * dpr;

  function frame() {
    // soft fade to build flowing trails
    ctx.fillStyle = "rgba(10,10,12,0.045)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    z += 0.0009;
    const alpha = 0.14 + intensity * 0.34;
    const mx = mouse.x * dpr, my = mouse.y * dpr;
    const R = radiusDev(), R2 = R * R;
    // pointer speed adds extra push so flicks "throw" the fluid
    const speedBoost = Math.min(Math.hypot(mouse.vx, mouse.vy) * 0.04, 2.2);

    for (const pt of particles) {
      let angle = Perlin.noise(pt.x * SCALE, pt.y * SCALE, z) * Math.PI * 3;

      // bend the path around the cursor
      if (mouse.active) {
        const dx = pt.x - mx, dy = pt.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const falloff = 1 - d / R;          // 1 at center -> 0 at edge
          const swirl = (1.4 + speedBoost) * falloff; // tangential strength
          const push = 0.9 * falloff;          // outward strength
          const flowX = Math.cos(angle), flowY = Math.sin(angle);
          // tangential (perpendicular to radius) + radial push, blended with flow
          const tx = -dy / d, ty = dx / d;
          const vx = flowX + tx * swirl + (dx / d) * push;
          const vy = flowY + ty * swirl + (dy / d) * push;
          angle = Math.atan2(vy, vx);
        }
      }

      const nx = pt.x + Math.cos(angle) * pt.speed;
      const ny = pt.y + Math.sin(angle) * pt.speed;

      ctx.strokeStyle = pt.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = pt.width;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      pt.x = nx; pt.y = ny; pt.life++;
      if (pt.life > pt.maxLife || pt.x < 0 || pt.x > w || pt.y < 0 || pt.y > h) {
        Object.assign(pt, spawn());
      }
    }

    // decay stored pointer velocity so flicks fade out
    mouse.vx *= 0.85; mouse.vy *= 0.85;

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }
  frame();
}

/* =========================================================
   Render projects grid
   ========================================================= */
function renderProjects() {
  const grid = document.querySelector("[data-projects-grid]");
  if (!grid) return;
  const total = projects.length;

  grid.innerHTML = projects.map((p, i) => {
    const num = String(total - i).padStart(2, "0");
    const sub = p.client || p.sub || "";

    // ---- Protected / NDA card ----
    if (p.locked) {
      const title = p.title || "Protected Project";
      const note = sub || "Available on request";
      const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Request to view protected work")}`;
      return `
      <a class="card card--locked" href="${mail}" data-card data-cursor-text="Ask">
        <div class="card__media">
          <span class="card__num"><span class="hash">#</span>${num}</span>
          <div class="card__redact"></div>
          <span class="card__lock">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm3 8H9V6a3 3 0 0 1 6 0v3zm-3 4a2 2 0 0 1 1 3.7V20h-2v-3.3A2 2 0 0 1 12 13z"/></svg>
            <span class="card__lock-badge">Under NDA</span>
          </span>
        </div>
        <div class="card__info">
          <span class="card__title">${title}</span>
          <span class="card__sub">${note}</span>
        </div>
      </a>`;
    }

    // ---- Normal video card ----
    const src = p.video || p.link || "";
    const poster = `poster="${p.poster || "assets/projects/placeholder.svg"}"`;
    // #t=0.1 nudges browsers to render a first frame as the thumbnail
    const srcAttr = src ? `src="${src}${src.includes("#") ? "" : "#t=0.1"}"` : "";
    return `
    <a class="card" href="${src || "#"}" data-card data-video="${src}" data-title="${(p.title || "").replace(/"/g, "&quot;")}" data-cursor-view>
      <div class="card__media">
        <span class="card__num"><span class="hash">#</span>${num}</span>
        <video class="card__video" ${srcAttr} ${poster} muted loop playsinline preload="metadata"></video>
        <span class="card__play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
      </div>
      <div class="card__info">
        <span class="card__title">${p.title || ""}</span>
        <span class="card__sub">${sub}</span>
      </div>
    </a>`;
  }).join("");

  initVideoCards();
}

/* =========================================================
   Video cards: silent hover preview + click to open player
   ========================================================= */
function initVideoCards() {
  const cards = document.querySelectorAll(".card[data-video]");
  const canHover = window.matchMedia("(hover: hover)").matches;

  cards.forEach((card) => {
    const src = card.getAttribute("data-video");
    const video = card.querySelector(".card__video");
    if (!src || !video) return;

    if (canHover) {
      card.addEventListener("mouseenter", () => {
        video.currentTime = 0;
        const pr = video.play();
        if (pr && pr.catch) pr.catch(() => {});
      });
      card.addEventListener("mouseleave", () => { video.pause(); });
    }

    card.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(src, card.getAttribute("data-title") || "");
    });
  });
}

/* =========================================================
   Lightbox popup player
   ========================================================= */
let _lightbox = null;
function buildLightbox() {
  if (_lightbox) return _lightbox;
  const el = document.createElement("div");
  el.className = "lightbox";
  el.setAttribute("data-lightbox", "");
  el.innerHTML = `
    <div class="lightbox__backdrop" data-lb-close></div>
    <button class="lightbox__close" data-lb-close aria-label="Close">
      <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>
    </button>
    <div class="lightbox__stage">
      <video class="lightbox__video" controls playsinline></video>
      <p class="lightbox__title"></p>
    </div>`;
  document.body.appendChild(el);
  el.querySelectorAll("[data-lb-close]").forEach((b) => b.addEventListener("click", closeLightbox));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  _lightbox = el;
  return el;
}
function openLightbox(src, title) {
  const el = buildLightbox();
  const video = el.querySelector(".lightbox__video");
  el.querySelector(".lightbox__title").textContent = title || "";
  video.src = src;
  el.classList.add("is-open");
  document.body.classList.add("no-scroll");
  if (window.__lenis) window.__lenis.stop();
  const pr = video.play();
  if (pr && pr.catch) pr.catch(() => {});
}
function closeLightbox() {
  if (!_lightbox || !_lightbox.classList.contains("is-open")) return;
  const video = _lightbox.querySelector(".lightbox__video");
  video.pause();
  video.removeAttribute("src");
  video.load();
  _lightbox.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  if (window.__lenis) window.__lenis.start();
}

/* =========================================================
   Custom cursor
   ========================================================= */
function initCursor() {
  const cursor = document.querySelector("[data-cursor]");
  const label = document.querySelector("[data-cursor-label]");
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener("mouseover", (e) => {
    const view = e.target.closest("[data-cursor-view]");
    const link = e.target.closest("a, button, [data-link]");
    if (view) { cursor.classList.add("is-view"); label.textContent = "View"; }
    else if (link) {
      cursor.classList.add("is-hover");
      const txt = link.getAttribute("data-cursor-text");
      if (txt) { cursor.classList.add("is-view"); label.textContent = txt; }
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("[data-cursor-view], a, button, [data-link]"))
      cursor.classList.remove("is-view", "is-hover");
  });
}

/* =========================================================
   Loader
   ========================================================= */
function initLoader() {
  return new Promise((resolve) => {
    const loader = document.querySelector("[data-loader]");
    const countEl = document.querySelector("[data-loader-count]");
    const bar = document.querySelector("[data-loader-bar]");
    const words = document.querySelectorAll("[data-loader-word]");
    if (!loader) { resolve(); return; }

    const tl = gsap.timeline({ onComplete: resolve });
    tl.to(words, { y: 0, duration: 1, ease: "power4.out", stagger: 0.08 }, 0);
    const counter = { v: 0 };
    tl.to(counter, {
      v: 100, duration: 2.2, ease: "power2.inOut",
      onUpdate: () => { const val = Math.round(counter.v); countEl.textContent = val; bar.style.width = val + "%"; }
    }, 0.1);
    tl.to(words, { y: "-110%", duration: 0.8, ease: "power4.in", stagger: 0.05 }, "+=0.2");
    tl.to(".loader__count", { y: "120%", opacity: 0, duration: 0.8, ease: "power4.in" }, "<");
    tl.to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.2");
    tl.set(loader, { display: "none" });
  });
}

/* ---------- split helper ---------- */
function splitWords(el) {
  el.innerHTML = el.textContent.split(" ").map(w => `<span class="word">${w}</span>`).join(" ");
  return el.querySelectorAll(".word");
}

/* =========================================================
   Hero intro reveal
   ========================================================= */
function introReveal() {
  gsap.to(".hero__line .ch-wrap", { y: 0, duration: 1.2, ease: "power4.out", stagger: 0.1, delay: 0.1 });
  gsap.to("[data-hero-sub]", { opacity: 1, duration: 1, ease: "power2.out", delay: 0.7 });
  gsap.from(".hero__corner", { opacity: 0, duration: 1, ease: "power2.out", stagger: 0.1, delay: 0.6 });
}

/* =========================================================
   Scroll transition: hero combines + reveals projects
   ========================================================= */
function initScrollScene(lenis) {
  gsap.registerPlugin(ScrollTrigger);

  // Pin the hero and play a scrubbed timeline as the user scrolls.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-stage]",
      start: "top top",
      end: "+=110%",
      scrub: true,
      pin: "[data-stage-pin]",
      pinSpacing: true,
    }
  });

  // Title zooms forward and dissolves
  tl.to("[data-hero-title]", { scale: 2.4, opacity: 0, ease: "power2.in" }, 0)
    .to("[data-hero-sub]", { opacity: 0, y: -40, ease: "power1.in" }, 0)
    .to([".hero__corner"], { opacity: 0, ease: "power1.in" }, 0)
    // flow lines settle / dim as they "combine"
    .to("[data-flow-veil]", { opacity: 0.55, ease: "none" }, 0)
    .add(() => {}, 0.5);

  // drive flow intensity down through the scene
  ScrollTrigger.create({
    trigger: "[data-stage]",
    start: "top top",
    end: "+=110%",
    scrub: true,
    onUpdate: (self) => {
      if (window.__setFlowIntensity) window.__setFlowIntensity(1 - self.progress * 0.82);
    }
  });

  // Project cards rise + fade in as the grid enters
  gsap.from("[data-card]", {
    yPercent: 18, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
    scrollTrigger: { trigger: ".projects__grid", start: "top 85%" }
  });

  // generic reveals (outside hero)
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const inner = el.querySelector("span") || el;
    gsap.set(inner, { yPercent: 110 });
    gsap.to(inner, { yPercent: 0, duration: 1, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  // about lead word brightening
  document.querySelectorAll("[data-words]").forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, {
      opacity: 1, ease: "none", stagger: 0.05,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 60%", scrub: true }
    });
  });
}

/* =========================================================
   Header hide on scroll down
   ========================================================= */
function initHeader(lenis) {
  const header = document.querySelector("[data-header]");
  let last = 0;
  const onScroll = (y) => {
    if (y > last && y > 200) header.classList.add("is-hidden");
    else header.classList.remove("is-hidden");
    last = y;
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY));
}

/* =========================================================
   Smooth scroll (Lenis)
   ========================================================= */
function initLenis() {
  if (!window.Lenis) return null;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  if (window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { duration: 1.4 }); }
    });
  });
  return lenis;
}

/* =========================================================
   Boot
   ========================================================= */
window.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("[data-year]").textContent = new Date().getFullYear();
  renderProjects();
  initFlow();
  initCursor();

  await initLoader();

  const lenis = initLenis();
  initHeader(lenis);
  introReveal();
  initScrollScene(lenis);
  ScrollTrigger.refresh();
});
