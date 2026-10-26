/* =====================================================================
   HIER ANPASSEN: alle Daten des Studios stehen in dieser Datei.
   Startseite, Kategorieseiten, Preisliste, Buchung und Standort bauen
   sich automatisch daraus auf.
   ===================================================================== */
const CONFIG = {
  studioName: "AURAË STUDIO",

  // Logo bzw. Bild, das dezent im Hintergrund der Kategorie-Seiten liegt (Wimpern, Brauen, Gesicht).
  // Leer lassen ("") = kein Hintergrundbild. Pro Kategorie kann unten mit `bg:` ein eigenes Bild gesetzt werden.
  logoImg: "bilder/9f36e7a3-2c84-438d-8a51-423032779e10.jpg",

  // WhatsApp ist vorerst AUS (leer lassen). Zum Aktivieren die Nummer eintragen,
  // OHNE +, Leerzeichen oder 00 (Deutschland: 49 + Nummer ohne führende 0), z. B. "491701234567".
  // Dann erscheinen der WhatsApp-Button und der WhatsApp-Link automatisch wieder.
  whatsapp: "",
  // Instagram-Name OHNE @
  instagram: "deinstudio",

  address: "Musterstraße 12, 12345 Musterstadt",
  tips: [
    "Parkplätze direkt vor dem Haus",
    "Bus-Haltestelle „Musterplatz“ in 2 Minuten zu Fuß",
    "Klingel: AURAË STUDIO, 2. Etage",
  ],

  // Öffnungszeiten: Wochentag (0 = Sonntag … 6 = Samstag) -> [Start, Ende] in Stunden, oder null = geschlossen
  hours: {
    1: null,
    2: [10, 18],
    3: [10, 18],
    4: [10, 19],
    5: [10, 18],
    6: [10, 15],
    0: null,
  },
  slotStepMinutes: 30,   // Abstand der wählbaren Startzeiten
  daysAhead: 21,         // wie viele Tage im Voraus angefragt werden kann
  minLeadHours: 12,      // frühestens so viele Stunden von jetzt an

  // Schon vergebene Zeiten – hier trägst du ein, was bereits belegt ist:
  // "JJJJ-MM-TT": ["10:00", "10:30", ...]   oder   "JJJJ-MM-TT": "ganztags"
  booked: {
    // "2026-10-22": ["10:00", "10:30", "11:00"],
    // "2026-10-24": "ganztags",
  },
};

/* ---------- Bilder-Slider auf der Startseite (rechts neben der Überschrift) ----------
   Bilder austauschen: img = Pfad zu deinem Foto (z. B. "bilder/lashes-1.jpg"), am besten im Hochformat 4:5.
   label = kleine Beschriftung unten im Bild (kann auch weggelassen werden).
   Beliebig viele Einträge möglich; mit nur einem Eintrag wird nicht gewechselt. */
const HERO_SLIDES = [
  { img: "bilder/wimpern/verländerung/wimp-verl1.2.jpg", alt: "Beispiel: Wimpernverlängerung", label: "Wimpernverlängerung" },
  { img: "bilder/wimpern/verländerung/wimpernlift1.jpg", alt: "Beispiel: Korean Lashlifting", label: "Korean Lashlifting" },
  { img: "bilder/brows/browlift3.jpg", alt: "Beispiel: Browlifting", label: "Browlifting" },
  { img: "bilder/gesicht/gesicht1.jpg", alt: "Beispiel: Aquafacial", label: "Aquafacial" },
];
const HERO_SLIDER = {
  autoplay: true,      // false = kein automatischer Wechsel
  intervalMs: 4500,    // Zeit pro Bild in Millisekunden
};

/* ---------- Oberkategorien (erscheinen auf der Startseite + in der Navigation) ----------
   Optional pro Kategorie: bg: "bilder/mein-hintergrund.jpg"  -> eigenes Hintergrundbild nur für diese Seite
   (ohne bg wird logoImg von oben verwendet). */
const CATEGORIES = [
  {
    id: "wimpern", page: "wimpern.html", title: "Wimpern", nav: "Wimpern",
    img: "bilder/wimpern/verlängerung/wimp-verl1.jpg",
    teaser: "Mehr Schwung, Länge und Fülle, von natürlich bis glamourös.",
    intro: "Ob Extensions oder Lifting deiner eigenen Wimpern: Such dir die Behandlung aus, die zu deinem Alltag passt. Wir beraten dich gerne vor Ort.",
  },
  {
    id: "brauen", page: "brauen.html", title: "Augenbrauen", nav: "Brauen",
    img: "bilder/brows/browlift3.jpg",
    teaser: "Gepflegte, volle Brauen, die dein Gesicht umrahmen.",
    intro: "Für einen offenen Blick und einen gepflegten Look: Hier findest du unsere Behandlungen für deine Augenbrauen.",
  },
  {
    id: "gesicht", page: "gesicht.html", title: "Gesichtsbehandlungen", nav: "Gesicht",
    img: "bilder/gesicht/Gesichtsbehandlung-backgr.jpg",
    teaser: "Strahlende, frische Haut mit sanften Wohlfühl-Behandlungen.",
    intro: "Von sanfter Tiefenreinigung bis zur intensiven Hauterneuerung: Wähle die Behandlung, die deiner Haut gerade guttut.",
  },
];

/* ---------- Behandlungen (cat = id der Oberkategorie) ----------
   Die PREISE stammen aus eurer Preisliste.
   ACHTUNG: "dur" (Dauer in Minuten) steht nicht in der Preisliste und ist GESCHÄTZT – bitte prüfen!
   Die Dauer bestimmt, welche Uhrzeiten im Terminformular angeboten werden.

   So ist eine Variante (items) aufgebaut:
     { name: "Lashlifting", dur: 60, price: 59 }                        -> einzelne Zeile
     { group: "3D Technik", variant: "Braun", dur: 135, price: 79 }     -> mehrere Varianten unter einer Überschrift
                                                                           (aufeinanderfolgende Einträge mit gleichem "group")
   Optional pro Variante:  desc: "Kurzbeschreibung"
                           addon: true  -> Zusatz-/Folgeleistung (z. B. Auffüllen), zählt nicht für „ab … €" auf der Startseite
                           pkg: true    -> Paket mit mehreren Terminen (Wunschtermin gilt für die 1. Sitzung)
   Optional pro Behandlung: img (ohne Bild wird nur der Text gezeigt), facts (Stichpunkte, darf fehlen), addon: true */
const SERVICES = [

  /* ===================== WIMPERN ===================== */
  {
    id: "lash", cat: "wimpern", title: "Wimpernverlängerung",
    img: "bilder/wimpern/verlängerung/wimp-verl2.jpg",
    text: "Einzelne Extensions für mehr Länge, Schwung und Fülle – von natürlich (1:1) bis voluminös (10D „Mega Volume“). Auf Wunsch auch in Braun.",
    facts: [
      "Wähle deine Technik: 1:1, Wet Set, 3D, 6D, 8D oder 10D",
      "Auf Wunsch auch in Braun",
      "Auffüllen in der 2. oder 3. Woche – siehe „Auffüllen“",
    ],
    items: [
      { group: "1:1 Technik", variant: "Standard", dur: 120, price: 65 },
      { group: "1:1 Technik", variant: "Braun", dur: 120, price: 69 },
      { name: "Wet Set / Wet & Whispy Set", dur: 120, price: 79 },
      { group: "3D Technik", variant: "Standard", dur: 135, price: 75 },
      { group: "3D Technik", variant: "Braun", dur: 135, price: 79 },
      { group: "6D Technik", variant: "Standard", dur: 150, price: 79 },
      { group: "6D Technik", variant: "Braun", dur: 150, price: 85 },
      { group: "8D Technik", variant: "Standard", dur: 165, price: 99 },
      { group: "8D Technik", variant: "Braun", dur: 165, price: 105 },
      { group: "10D Technik „Mega Volume“", variant: "Standard", dur: 180, price: 120 },
      { group: "10D Technik „Mega Volume“", variant: "Braun", dur: 180, price: 125 },
    ],
  },
  {
    id: "refill", cat: "wimpern", title: "Auffüllen", addon: true,
    img: "bilder/wimpern/lift/auffüllen1.jpg",
    text: "Damit dein Look frisch bleibt: Auffüllen deiner Wimpernverlängerung. Der Preis richtet sich nach deiner Technik und danach, ob du in der 2. oder 3. Woche kommst.",
    facts: [
      "Preis je nach Technik",
      "2. Woche oder 3. Woche",
    ],
    items: [
      { group: "1:1 Technik", variant: "2. Woche", dur: 60, price: 40 },
      { group: "1:1 Technik", variant: "3. Woche", dur: 75, price: 45 },
      { group: "Wet Set / Wet & Whispy", variant: "2. Woche", dur: 60, price: 49 },
      { group: "Wet Set / Wet & Whispy", variant: "3. Woche", dur: 75, price: 55 },
      { group: "3D Technik", variant: "2. Woche", dur: 75, price: 45 },
      { group: "3D Technik", variant: "3. Woche", dur: 90, price: 50 },
      { group: "6D Technik", variant: "2. Woche", dur: 75, price: 50 },
      { group: "6D Technik", variant: "3. Woche", dur: 90, price: 52 },
      { group: "8D Technik", variant: "2. Woche", dur: 90, price: 55 },
      { group: "8D Technik", variant: "3. Woche", dur: 105, price: 60 },
      { group: "10D Technik „Mega Volume“", variant: "2. Woche", dur: 90, price: 70 },
      { group: "10D Technik „Mega Volume“", variant: "3. Woche", dur: 105, price: 75 },
    ],
  },
  {
    id: "lashlift", cat: "wimpern", title: "Lashlifting",
    img: "bilder/wimpern/lift/lashlift1.jpg",
    text: "Deine eigenen Wimpern werden in Form gebracht – pflegeleicht und mit schönem Schwung für mehrere Wochen.",
    facts: [
      "Hält bis zu 6 Wochen",
      "Eigene Wimpern, keine Extensions",
      "Ideal, wenn du morgens Zeit sparen möchtest",
    ],
    items: [
      { name: "Lashlifting", dur: 60, price: 59 },
    ],
  },
  {
    id: "korean", cat: "wimpern", title: "Korean Lashlifting",
    img: "bilder/wimpern/lift/wimpernlift1.1.jpg",
    text: "Die Weiterentwicklung des klassischen Liftings: Die Wimpern werden schon ab dem Ansatz aufgerichtet und wirken dadurch länger, offener und dichter.",
    facts: [
      "Hält ca. 6–8 Wochen",
      "Aufrichtung direkt ab dem Wimpernansatz",
      "Auch ohne Extensions ein wacher, offener Blick",
    ],
    items: [
      { name: "Korean Lashlifting", dur: 75, price: 65 },
    ],
  },
  {
    id: "remove", cat: "wimpern", title: "Wimpern entfernen", addon: true,
    text: "Du möchtest deine Wimpernverlängerung entfernen lassen? Das übernehmen wir professionell.",
    items: [
      { name: "Wimpernverlängerung professionell entfernen", dur: 30, price: 15 },
    ],
  },

  /* ===================== AUGENBRAUEN ===================== */
  {
    id: "brow", cat: "brauen", title: "Browlifting",
    img: "bilder/brows/browlift2.jpg",
    text: "Die Härchen werden nach oben gebürstet und fixiert – für volle, gepflegte Brauen. Wähle Lifting pur oder gleich im Komplettpaket mit Färben und Shaping.",
    facts: [
      "Hält ca. 4–6 Wochen",
      "Ideal bei widerspenstigen oder buschigen Härchen",
      "Form und Farbe nach deinem Wunsch",
    ],
    items: [
      { name: "Browlifting", dur: 45, price: 55 },
      { name: "Browlifting + Färben", dur: 60, price: 60 },
      { name: "Browlifting Komplett", desc: "Lifting + Färben + Shaping", dur: 75, price: 65 },
    ],
  },
  {
    id: "shaping", cat: "brauen", title: "Brow Shaping & Färben",
    img: "bilder/brows/brow-shape1.jpg",
    text: "Form und Farbe für deine Brauen: Beim Brow Shaping messen wir deine Brauen aus (Mapping) und zupfen sie in Form. Färben gibt es auch einzeln.",
    items: [
      { name: "Brow Shaping", desc: "Mapping & Zupfen", dur: 30, price: 20 },
      { name: "Augenbrauen färben", dur: 15, price: 5, addon: true },
    ],
  },

  /* ===================== GESICHT ===================== */
  {
    id: "aqua", cat: "gesicht", title: "Aquafacial",
    img: "bilder/gesicht/aqua/gesicht1.1.jpg",
    text: "Sanfte Tiefenreinigung, Peeling und Feuchtigkeitsschub – ohne Ausfallzeit. Dein erster Termin ist das Kennenlern-Aquafacial.",
    facts: [
      "Kennenlern-Termin inkl. Beratung, Hautanalyse und Behandlungsabstimmung",
      "Direkt danach wieder gesellschaftsfähig – keine Ausfallzeit",
      "Schöner Frische-Kick vor besonderen Anlässen",
    ],
    items: [
      { name: "Kennenlern Aquafacial", desc: "Für deinen ersten Termin – inkl. Beratung, Hautanalyse und Behandlungsabstimmung", dur: 75, price: 89 },
      { name: "Aquafacial Signature", dur: 75, price: 109 },
    ],
  },
  {
    id: "micro", cat: "gesicht", title: "Microneedling",
    img: "bilder/gesicht/micro-needling/micro_needl1.1.jpg",
    text: "Feine Nadeln regen die Hauterneuerung an – für ein glatteres, frischeres Hautbild. Classic oder mit PDRN für noch mehr Regeneration.",
    facts: [
      "Classic: Glow, Poren und Hautstruktur",
      "Mit PDRN: stärkere Regeneration & Anti-Aging",
      "Leichte Rötung nach der Behandlung ist normal",
    ],
    items: [
      { name: "Microneedling Classic", desc: "Glow, Poren, Hautstruktur", dur: 75, price: 99 },
      { name: "Microneedling mit PDRN", desc: "Stärkere Regeneration & Anti-Aging", dur: 75, price: 129 },
    ],
  },
  {
    id: "combo", cat: "gesicht", title: "Aquafacial + Microneedling",
    img: "bilder/gesicht/micro-needling/aqua_und_micro_needl1.jpg",
    text: "Beide Behandlungen kombiniert: Tiefenreinigung und Hauterneuerung – wahlweise mit Microneedling Classic oder PDRN.",
    items: [
      { name: "Aquafacial + Microneedling Classic", dur: 135, price: 165 },
      { name: "Aquafacial + Microneedling PDRN", dur: 135, price: 185 },
    ],
  },
  {
    id: "pack", cat: "gesicht", title: "Pakete",
    img: "bilder/gesicht/micro-needling/paket1.jpg",
    text: "Mehrere Behandlungen im Paket – günstiger als einzeln gebucht.",
    facts: [
      "Der Wunschtermin im Formular gilt für deine 1. Sitzung",
    ],
    items: [
      { name: "Microneedling Classic – 3 Behandlungen", dur: 75, price: 269, pkg: true },
      { name: "Microneedling PDRN – 3 Sitzungen", dur: 75, price: 319, pkg: true },
      { name: "Skin Glow Paket", desc: "2× Aquafacial + 1× Microneedling", dur: 75, price: 249, pkg: true },
    ],
  },
];
