/* Logik der Startseite: Kategorie-Karten, Preisliste, Terminanfrage, Standort.
   Die Daten kommen aus data.js, gemeinsame Teile aus common.js. */

const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const state = { serviceKey: null, day: null, slot: null };

document.title = `${CONFIG.studioName} – Wimpern, Brauen & Gesichtsbehandlungen`;

/* ---------- Kategorie-Karten ---------- */
$("#categoryCards").innerHTML = CATEGORIES.map((c) => {
  const list = servicesOf(c.id).map((s) => s.title).join(" · ");
  return `
    <a class="card card--link" href="${c.page}">
      <img src="${c.img}" alt="${c.title}" loading="lazy" />
      <div class="card__body">
        <h3>${c.title}</h3>
        <p>${c.teaser}</p>
        <span class="card__list">${list}</span>
        <span class="card__meta">ab ${euro(minPriceOf(c.id))}</span>
        <span class="card__more">Ansehen →</span>
      </div>
    </a>`;
}).join("");

/* ---------- Preisliste mit Tabs ---------- */
let activeCat = CATEGORIES[0].id;

/* Eine Zeile der Preisliste: einzelne Position oder Gruppe mit mehreren Varianten (z. B. Standard / Braun) */
function priceRow(g) {
  if (!g.group) {
    const it = g.items[0];
    return `
      <div class="price__row">
        <span class="price__name">${it.name}</span>
        <span class="price__amount">${euro(it.price)}</span>
        <span class="price__desc">${it.desc ? it.desc + " · " : ""}<span class="price__dur">${fmtDur(it.dur)}</span></span>
      </div>`;
  }
  return `
    <div class="price__row price__row--multi">
      <span class="price__name">${g.group}</span>
      <span class="price__opts">${g.items.map((it) =>
        `<span class="price__opt"><small>${it.variant}</small><b>${euro(it.price)}</b></span>`).join("")}</span>
    </div>`;
}

function renderPrices() {
  $("#priceTabs").innerHTML = CATEGORIES
    .map((c) => `<button class="tab" role="tab" aria-selected="${c.id === activeCat}" data-cat="${c.id}">${c.title}</button>`)
    .join("");
  $("#priceTabs").querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => { activeCat = t.dataset.cat; renderPrices(); })
  );

  $("#priceList").innerHTML = servicesOf(activeCat)
    .map((s) =>
      `<h3 class="price__group">${s.title}</h3>` + groupItems(s.items).map(priceRow).join("")
    ).join("") +
    `<p class="price__more"><a href="${catById(activeCat).page}">Mehr zu ${catById(activeCat).title} →</a></p>`;
}
renderPrices();

/* ---------- Buchung: Behandlung ---------- */
const ITEMS = {};
SERVICES.forEach((s) => s.items.forEach((it, i) => (ITEMS[`${s.id}:${i}`] = { ...it, service: s })));

$("#serviceSelect").innerHTML =
  `<option value="">Bitte wählen …</option>` +
  CATEGORIES.map((c) =>
    servicesOf(c.id).map((s) =>
      `<optgroup label="${c.title} – ${s.title}">` +
      s.items.map((it, i) => `<option value="${s.id}:${i}">${itemLabel(it)} – ${euro(it.price)}</option>`).join("") +
      `</optgroup>`).join("")
  ).join("");

function setService(key) {
  state.serviceKey = ITEMS[key] ? key : null;
  $("#serviceSelect").value = state.serviceKey || "";
  const it = ITEMS[state.serviceKey];
  $("#serviceInfo").textContent = it
    ? `Dauer ca. ${fmtDur(it.dur)} · ${euro(it.price)}${it.pkg ? " · Paket: Der Wunschtermin gilt für die 1. Sitzung" : ""}`
    : "";
  state.slot = null;
  renderSlots();
  renderSummary();
}
$("#serviceSelect").addEventListener("change", (e) => setService(e.target.value));

/* ---------- Buchung: Tage ---------- */
function buildDays() {
  const out = [];
  const now = new Date();
  for (let i = 0; i <= CONFIG.daysAhead; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const h = CONFIG.hours[d.getDay()];
    if (!h) continue;
    if (CONFIG.booked[isoDate(d)] === "ganztags") continue;
    /* Heute/morgen weglassen, wenn die Öffnungszeit schon vorbei bzw. die Vorlaufzeit nicht mehr reicht */
    const closesAt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h[1]).getTime();
    if (closesAt <= Date.now() + CONFIG.minLeadHours * 3600 * 1000) continue;
    out.push(d);
  }
  return out;
}

const dayBox = $("#dayChips");
dayBox.innerHTML = buildDays().map((d) => `
  <button type="button" class="chip" role="radio" aria-checked="false" data-day="${isoDate(d)}">
    ${DAY_NAMES[d.getDay()].slice(0, 2)}.<small>${pad(d.getDate())}.${pad(d.getMonth() + 1)}.</small>
  </button>`).join("");

dayBox.querySelectorAll(".chip").forEach((c) =>
  c.addEventListener("click", () => {
    state.day = c.dataset.day;
    state.slot = null;
    dayBox.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-checked", x === c));
    renderSlots();
    renderSummary();
  })
);

/* ---------- Buchung: Uhrzeiten ---------- */
function renderSlots() {
  const box = $("#slotChips");
  const it = ITEMS[state.serviceKey];
  if (!it || !state.day) {
    box.innerHTML = `<p class="hint">Bitte zuerst Behandlung und Tag wählen.</p>`;
    return;
  }
  const [y, m, d] = state.day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const [open, close] = CONFIG.hours[date.getDay()];
  const blocked = CONFIG.booked[state.day] || [];
  const earliest = Date.now() + CONFIG.minLeadHours * 3600 * 1000;

  const slots = [];
  for (let min = open * 60; min + it.dur <= close * 60; min += CONFIG.slotStepMinutes) {
    const label = `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
    const start = new Date(y, m - 1, d, Math.floor(min / 60), min % 60).getTime();
    if (start < earliest || blocked.includes(label)) continue;
    slots.push(label);
  }

  if (!slots.length) {
    box.innerHTML = `<p class="hint">An diesem Tag ist leider nichts mehr frei – bitte wähle einen anderen Tag.</p>`;
    return;
  }
  box.innerHTML = slots.map((s) =>
    `<button type="button" class="chip" role="radio" aria-checked="${s === state.slot}" data-slot="${s}">${s}</button>`).join("");
  box.querySelectorAll(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      state.slot = c.dataset.slot;
      box.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-checked", x === c));
      renderSummary();
    })
  );
}

/* ---------- Zusammenfassung & Nachricht ---------- */
function prettyDate() {
  const [y, m, d] = state.day.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAY_NAMES[dt.getDay()]}, ${pad(d)}.${pad(m)}.${y}`;
}

function buildMessage() {
  const it = ITEMS[state.serviceKey];
  const name = $("#name").value.trim();
  const note = $("#note").value.trim();
  return [
    `Hallo ${CONFIG.studioName}! 🌸`,
    `Ich möchte gerne einen Termin anfragen:`,
    ``,
    `• Behandlung: ${itemTitle(it)} (${euro(it.price)}, ca. ${fmtDur(it.dur)})`,
    it.pkg ? `• Hinweis: Paket – der Wunschtermin gilt für die 1. Sitzung` : null,
    `• Wunschtermin: ${prettyDate()} um ${state.slot} Uhr`,
    `• Name: ${name}`,
    note ? `• Anmerkung: ${note}` : null,
    ``,
    `Gibt es den Termin noch? Ich freue mich auf deine Rückmeldung!`,
  ].filter((l) => l !== null).join("\n");
}

function renderSummary() {
  const box = $("#summary");
  const it = ITEMS[state.serviceKey];
  if (!it || !state.day || !state.slot) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<strong>Deine Anfrage:</strong> ${itemTitle(it)} · ${prettyDate()} · ${state.slot} Uhr · ${euro(it.price)}`;
}

function validate() {
  if (!state.serviceKey) return toast("Bitte wähle zuerst eine Behandlung."), false;
  if (!state.day) return toast("Bitte wähle einen Wunschtag."), false;
  if (!state.slot) return toast("Bitte wähle eine Uhrzeit."), false;
  if (!$("#name").value.trim()) return toast("Bitte gib deinen Vornamen an."), false;
  return true;
}

/* WhatsApp nur anzeigen, wenn in data.js eine Nummer eingetragen ist */
if (CONFIG.whatsapp) {
  $("#sendWA").addEventListener("click", () => {
    if (!validate()) return;
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener");
  });
} else {
  $("#sendWA").remove();
  $(".send").classList.add("send--single");
}

/* Text in die Zwischenablage kopieren (mit Fallback für ältere Browser / unsichere Seiten) */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* weiter mit Fallback */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

/* Instagram kann keinen Text vorausfüllen: Nachricht kopieren, Hinweis zeigen, danach die DM öffnen.
   Weiterleitung im selben Tab – Popup-Blocker verhindern window.open nach einer Verzögerung oft,
   und am Handy öffnet sich dabei direkt die Instagram-App. */
$("#sendIG").addEventListener("click", async (e) => {
  if (!validate()) return;
  const btn = e.currentTarget;
  btn.disabled = true;                       // kein Doppelklick während der Weiterleitung
  const copied = await copyText(buildMessage());
  toast(copied
    ? "✓ Nachricht kopiert! Bitte bei Instagram einfach einfügen."
    : "Bitte schreib uns in der DM deinen Wunschtermin.");
  setTimeout(() => {
    window.location.href = `https://ig.me/m/${CONFIG.instagram}`;
    btn.disabled = false;                    // falls man mit „Zurück" wiederkommt
  }, copied ? 1500 : 2200);
});

/* ---------- Vorauswahl über Link, z. B. /?s=korean:0#termin (kommt von den Kategorie-Seiten) ---------- */
const preset = new URLSearchParams(location.search).get("s");
if (preset && ITEMS[preset]) {
  setService(preset);
  $("#termin").scrollIntoView();
  history.replaceState(null, "", location.pathname + "#termin");   // „?s=…" wieder aus der Adresszeile entfernen
}

/* ---------- Standort ---------- */
const q = encodeURIComponent(CONFIG.address);
$("#mapLoad").addEventListener("click", () => {
  const f = document.createElement("iframe");
  f.title = "Karte zum Studio"; f.referrerPolicy = "no-referrer-when-downgrade";
  f.src = `https://www.google.com/maps?q=${q}&output=embed`;
  $("#mapPh").replaceWith(f);
});
$("#routeBtn").href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
$("#addressText").innerHTML = CONFIG.address.replace(/, /, "<br>");
$("#tipsList").innerHTML = CONFIG.tips.map((t) => `<li>${t}</li>`).join("");
if (CONFIG.whatsapp) {
  $("#waLink").href = `https://wa.me/${CONFIG.whatsapp}`;
} else {
  $("#waLink").remove();
  $("#contactSep").remove();
}
$("#igLink").href = `https://instagram.com/${CONFIG.instagram}`;

$("#hoursList").innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
  const h = CONFIG.hours[d];
  return `<li><span>${DAY_NAMES[d]}</span><span>${h ? `${pad(h[0])}:00 – ${pad(h[1])}:00` : "geschlossen"}</span></li>`;
}).join("");

/* ---------- Mobiler Button ausblenden, wenn Termin-Bereich sichtbar ---------- */
const fab = $("#fab");
new IntersectionObserver(
  ([e]) => (fab.style.display = e.isIntersecting ? "none" : ""),
  { threshold: 0.15 }
).observe($("#termin"));

/* ---------- Toast ---------- */
let toastTimer;
function toast(text) {
  const t = $("#toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}
