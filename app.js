/* ==========================
   Helpers
========================== */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

/* ==========================
   Footer year
========================== */
$("#year").textContent = new Date().getFullYear();

/* ==========================
   Mobile nav
========================== */
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

function closeNav() {
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

$$(".nav__link").forEach((a) => a.addEventListener("click", closeNav));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});
document.addEventListener("click", (e) => {
  if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeNav();
});

/* ==========================
   Theme toggle (persist)
========================== */
const themeToggle = $("#themeToggle");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
    return;
  }
  // Default: dark (elegante)
  setTheme("dark");
}
initTheme();

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

/* ==========================
   Projects filter
========================== */
const filters = $$(".filter");
const projects = $$(".project");

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    const key = btn.dataset.filter;
    projects.forEach((card) => {
      const tags = (card.dataset.tags || "").split(" ");
      const show = key === "all" || tags.includes(key);
      card.classList.toggle("is-hidden", !show);
    });

    // A11y state
    filters.forEach((b) => b.setAttribute("aria-selected", "false"));
    btn.setAttribute("aria-selected", "true");
  });
});

/* ==========================
   Contact form -> mailto fallback
========================== */
const form = $("#contactForm");
const hint = $("#formHint");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = (fd.get("name") || "").toString().trim();
  const email = (fd.get("email") || "").toString().trim();
  const message = (fd.get("message") || "").toString().trim();

  if (!name || !email || !message) {
    hint.textContent = "Por favor, completa todos los campos.";
    return;
  }

  const subject = encodeURIComponent(`Contacto portfolio — ${name}`);
  const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);
  const to = "Cris11salle@gmail.com";

  hint.textContent = "Abriendo tu correo para enviar el mensaje…";
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  setTimeout(() => (hint.textContent = ""), 2500);
});

/* ==========================
   Active section highlight (simple)
========================== */
const sections = ["about", "skills", "experience", "education", "projects", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const links = $$(".nav__link");

const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      links.forEach((a) => {
        const active = a.getAttribute("href") === `#${id}`;
        a.style.color = active ? "var(--text)" : "";
        a.style.background = active ? "rgba(255,255,255,.05)" : "";
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 },
);

sections.forEach((s) => obs.observe(s));

/* ==========================
   Scroll progress + back to top
========================== */
const progressBar = $("#scrollProgress");
const backTop = $("#backTop");

function onScroll() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  if (progressBar) progressBar.style.width = pct.toFixed(2) + "%";

  if (backTop) backTop.classList.toggle("is-show", scrollTop > 500);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ==========================
   Reveal on scroll
========================== */
const revealEls = $$("[data-reveal]");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-inview");
      revealObs.unobserve(e.target);
    });
  },
  { threshold: 0.12 },
);
revealEls.forEach((el) => revealObs.observe(el));

/* ==========================
   Project case modal
========================== */
const caseModal = $("#caseModal");
const caseClose = $("#caseClose");
const caseTitle = $("#caseTitle");
const caseContext = $("#caseContext");
const caseRole = $("#caseRole");
const caseHighlights = $("#caseHighlights");
const caseResult = $("#caseResult");

function openCase(card) {
  if (!caseModal) return;

  const title = $(".card__title", card)?.textContent?.trim() || "Caso";
  caseTitle.textContent = title;

  caseContext.textContent = card.dataset.context || "—";
  caseRole.textContent = card.dataset.role || "—";
  caseHighlights.textContent = card.dataset.highlights || "—";
  caseResult.textContent = card.dataset.result || "—";

  caseModal.showModal();
  document.body.style.overflow = "hidden";
}

function closeCase() {
  if (!caseModal) return;
  caseModal.close();
  document.body.style.overflow = "";
}

$$("[data-case='open']").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.currentTarget.closest(".project");
    if (card) openCase(card);
  });
});

caseClose?.addEventListener("click", closeCase);
caseModal?.addEventListener("click", (e) => {
  const inner = $(".modal__inner", caseModal);
  if (inner && !inner.contains(e.target)) closeCase();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && caseModal?.open) closeCase();
});
caseModal?.addEventListener("close", () => {
  document.body.style.overflow = "";
});
