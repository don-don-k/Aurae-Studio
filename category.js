/* Logik der Kategorie-Seiten (wimpern/, brauen/, gesicht/).
   Welche Kategorie angezeigt wird, steht im <body data-category="…">. */

const cat = catById(document.body.dataset.category);
const services = servicesOf(cat.id);
const bookLink = (key) => `${ROOT}?s=${encodeURIComponent(key)}#termin`;

document.title = `${cat.title} – ${CONFIG.studioName}`;

/* ---------- Hintergrundbild im Seitenkopf (cat.bg, sonst CONFIG.logoImg) ---------- */
const bgImg = asset(cat.bg || CONFIG.logoImg);
if (bgImg) {
  $(".page-hero").insertAdjacentHTML(
    "afterbegin",
    `<div class="hero__bg" aria-hidden="true"><img src="${bgImg}" alt="" /></div>`
  );
}

/* ---------- Kopfbereich ---------- */
$("#crumbName").textContent = cat.title;
$("#catTitle").textContent = cat.title;
$("#catIntro").textContent = cat.intro;

/* Sprungmarken zu den einzelnen Behandlungen */
$("#jump").innerHTML = services
  .map((s) => `<a class="jump__chip" href="#${s.id}">${s.title}</a>`)
  .join("");

/* ---------- Behandlungen ---------- */
/* Einzelne Variante: Name, Dauer, Preis und Button */
const singleRow = (s, it) => `
  <div class="variant">
    <div class="variant__info">
      <strong>${it.name}</strong>
      <small>${it.desc ? it.desc + " · " : ""}${fmtDur(it.dur)}</small>
    </div>
    <span class="variant__price">${euro(it.price)}</span>
    <a class="btn btn--small" href="${bookLink(`${s.id}:${it.i}`)}">Anfragen</a>
  </div>`;

/* Gruppe mit mehreren Varianten (z. B. Standard / Braun oder 2. / 3. Woche): jede Variante ist ein antippbares Feld */
const groupRow = (s, g) => `
  <div class="variant variant--group">
    <div class="variant__info"><strong>${g.group}</strong></div>
    <div class="opts">
      ${g.items.map((it) => `
        <a class="opt" href="${bookLink(`${s.id}:${it.i}`)}" aria-label="${g.group} – ${it.variant}, ${euro(it.price)}: Termin anfragen">
          <span class="opt__lbl">${it.variant}</span>
          <span class="opt__price">${euro(it.price)}</span>
          <span class="opt__dur">${fmtDur(it.dur)}</span>
        </a>`).join("")}
    </div>
  </div>`;

$("#treatments").innerHTML = services.map((s) => {
  const groups = groupItems(s.items);
  const hasGroups = groups.some((g) => g.group);
  return `
  <article class="treat${s.img ? "" : " treat--plain"}" id="${s.id}">
    ${s.img ? `<img class="treat__img" src="${asset(s.img)}" alt="${s.title}" loading="lazy" />` : ""}
    <div class="treat__body">
      <h2>${s.title}</h2>
      <p class="treat__text">${s.text}</p>
      ${s.facts && s.facts.length ? `<ul class="facts">${s.facts.map((f) => `<li>${f}</li>`).join("")}</ul>` : ""}

      <h3 class="treat__sub">Wähle deine Variante</h3>
      ${hasGroups ? `<p class="hint treat__tip">Tippe auf eine Variante, um direkt einen Termin anzufragen.</p>` : ""}
      <div class="variants">
        ${groups.map((g) => (g.group ? groupRow(s, g) : singleRow(s, g.items[0]))).join("")}
      </div>
    </div>
  </article>`;
}).join("");

/* ---------- Weitere Kategorien + Vor/Zurück ---------- */
const idx = CATEGORIES.findIndex((c) => c.id === cat.id);
const prev = CATEGORIES[(idx - 1 + CATEGORIES.length) % CATEGORIES.length];
const next = CATEGORIES[(idx + 1) % CATEGORIES.length];

$("#otherCats").innerHTML = CATEGORIES.filter((c) => c.id !== cat.id).map((c) => `
  <a class="card card--link" href="${ROOT}${c.page}">
    <img src="${asset(c.img)}" alt="${c.title}" loading="lazy" />
    <div class="card__body">
      <h3>${c.title}</h3>
      <p>${c.teaser}</p>
      <span class="card__more">Ansehen →</span>
    </div>
  </a>`).join("");

$("#pager").innerHTML = `
  <a class="pager__link" href="${ROOT}${prev.page}">← ${prev.title}</a>
  <a class="pager__link pager__link--center" href="${ROOT}#behandlungen">Zur Übersicht</a>
  <a class="pager__link" href="${ROOT}${next.page}">${next.title} →</a>`;
