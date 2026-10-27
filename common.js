/* Gemeinsame Teile für ALLE Seiten: Navigation, Footer, Hilfsfunktionen.
   Navigation oder Footer ändern? Einmal hier anpassen – gilt dann überall. */

const $ = (s) => document.querySelector(s);
/* Pfad zurück zur Startseite: "" auf der Startseite, "../" auf den Unterseiten (steht im <body data-root="…">) */
const ROOT = document.body.dataset.root || "";
/* Bildpfade aus data.js (z. B. "bilder/foto.jpg") gelten ab der Startseite – auf Unterseiten wird ROOT davorgesetzt.
   Komplette Internet-Adressen (https://…) bleiben unverändert. */
const asset = (p) => (!p || /^([a-z]+:)?\/\//i.test(p) || p.startsWith("data:") ? p : ROOT + p);
const euro = (n) => n.toLocaleString("de-DE") + " €";
const pad = (n) => String(n).padStart(2, "0");
const fmtDur = (m) => (m >= 60 ? `${Math.floor(m / 60)} Std.${m % 60 ? " " + (m % 60) + " Min." : ""}` : `${m} Min.`);
const catById = (id) => CATEGORIES.find((c) => c.id === id);
const servicesOf = (catId) => SERVICES.filter((s) => s.cat === catId);
/* „ab … €": Zusatzleistungen (addon: true) zählen nicht mit */
const minPriceOf = (catId) =>
  Math.min(...servicesOf(catId).filter((s) => !s.addon).flatMap((s) => s.items.filter((i) => !i.addon).map((i) => i.price)));

/* Name einer Variante: bei Gruppen „3D Technik – Braun", sonst der Name */
const itemLabel = (it) => (it.group ? `${it.group} – ${it.variant}` : it.name);
/* Vollständiger Titel inkl. Behandlung (it.service muss gesetzt sein), ohne Doppelungen */
const itemTitle = (it) => {
  const l = itemLabel(it);
  return it.service && it.service.title !== l ? `${it.service.title} – ${l}` : l;
};
/* Dauer oder Spanne, z. B. „1 Std. – 1 Std. 15 Min." */
const durRange = (items) => {
  const d = items.map((i) => i.dur);
  const a = Math.min(...d), b = Math.max(...d);
  return a === b ? fmtDur(a) : `${fmtDur(a)} – ${fmtDur(b)}`;
};
/* Fasst aufeinanderfolgende Varianten mit gleichem „group" zusammen.
   Jeder Eintrag behält seinen Original-Index (i) für die Terminauswahl. */
function groupItems(items) {
  const out = [];
  items.forEach((it, i) => {
    const e = { ...it, i };
    const last = out[out.length - 1];
    if (it.group && last && last.group === it.group) last.items.push(e);
    else out.push({ group: it.group || null, items: [e] });
  });
  return out;
}

(function buildChrome() {
  const current = document.body.dataset.category || null;

  /* ---------- Header ---------- */
  const catLinks = CATEGORIES.map(
    (c) => `<a href="${ROOT}${c.page}"${c.id === current ? ' aria-current="page"' : ""}>${c.nav}</a>`
  ).join("");

  const header = `
  <header class="nav" id="top">
    <div class="container nav__inner">
      <a href="${ROOT || "./"}" class="nav__logo">${CONFIG.studioName}</a>
      <nav class="nav__links" id="navLinks" aria-label="Hauptnavigation">
        ${catLinks}
        <a href="${ROOT}#preise">Preise</a>
        <a href="${ROOT}#ueber-mich">Über mich</a>
        <a href="${ROOT}#standort">Standort</a>
        <a href="${ROOT}#termin" class="btn btn--small nav__cta">Termin anfragen</a>
      </nav>
      <button class="nav__burger" id="burger" aria-label="Menü öffnen" aria-expanded="false" aria-controls="navLinks">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;;

  /* ---------- Footer ---------- */
  const footer = `
  <footer class="footer">
    <div class="container footer__inner">
      <span>© ${new Date().getFullYear()} ${CONFIG.studioName}</span>
      <span>
        <a href="${ROOT}impressum.html">Impressum</a> ·
        <a href="${ROOT}datenschutz.html">Datenschutz</a>
      </span>
    </div>
  </footer>
  <a class="fab" id="fab" href="${ROOT}#termin" aria-label="Termin anfragen">Termin anfragen</a>`;

  $("#site-header").outerHTML = header;
  $("#site-footer").outerHTML = footer;

  /* ---------- Burger-Menü ---------- */
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );
})();
