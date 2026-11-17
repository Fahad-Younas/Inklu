/* INKLU – place data, search and popup */
const SECTIONS = [
  ["Physical access", ["Step-free route to main entrance (critical)", "Ramp no steeper than 1:12, with handrails", "Doors 900 mm or wider", "Main paths 1200 mm or wider, firm and even", "Lift or ramp to all public floors", "Rest points every 50–100 m"]],
  ["Washroom access", ["Accessible toilet, step-free (critical)", "Cubicle fits a 1500 mm turning circle", "Grab bars with transfer space", "Basin, mirror, soap and dryer reachable seated", "Emergency alarm and clear sign", "Clean and unlocked; baby-changing available"]],
  ["Parking and transport", ["Marked accessible bays near the entrance", "Bay 3.6 m wide or marked transfer aisle", "Firm, step-free route from bay to entrance", "Safe drop-off point close to the entrance", "Accessible or assisted transport option", "Route from parking lit and sheltered"]],
  ["Staff and service", ["Staff know access needs", "Staff offer help on request", "Access contact person or phone", "Service animals and mobility aids welcome", "Ticket, queue and payment points usable seated", "Staff trained in the last 12 months"]],
  ["Information", ["Access information online before the visit", "Online information matches the site", "Clear, high-contrast signs", "Information in more than one format", "Emergency exits and instructions accessible", "Contact route for access questions"]]
];
const RATINGS = ["Fully accessible", "Mostly accessible", "Partly accessible", "Limited access"];
const LABEL = { Y: "Yes", N: "No", X: "N/A", "-": "Not recorded" };

/* Add or edit places here. img = file name in the site folder.
   audit = 30 letters in checklist order A1–E6: Y yes, N no, X not applicable, - not recorded.
   Leave audit out for a place that has not been audited yet. */
const PLACES = [
  { name: "Islamabad Museum", desc: "Cultural museum with historical and archaeological collections.", img: "museum.jpg", audit: "YYYYYN YYYXNN YYYYYY YYXNYN YXYNXN" },
  { name: "Lok Virsa Heritage Museum", desc: "National museum celebrating Pakistan’s folk heritage and crafts.", img: "lok-virsa.jpg", audit: "YYYYXY YYXXYY YYYYYY YYXNYY NXXYNN" },
  { name: "Pakistan Museum of Natural History", desc: "Exhibits on wildlife, geology and fossils.", img: "pk-museum.jpg", audit: "YYYYYX YYXXXY YYYYYY YYXNYX YXYYYN" },
  { name: "New Blue Area", desc: "Busy dining and shopping strip in central Islamabad.", img: "new-blue.jpg", audit: "YNNNNN YNNNNY YYYYYY YYNNNX YXNNNN" },
  { name: "Lake View Park", desc: "Lakeside park with walking paths and gardens.", img: "lakeview.jpg", audit: "Y----- YNNXNY YYYYYY NNNNYX NNXXYN" },
  { name: "Pakistan Monument", desc: "National monument and museum on the Shakarparian hills.", img: "pkmonument.jpg", audit: "YYYYYY YYYYYY YYYYYY YYNXYN YNYXYN" },
  { name: "Faisal Mosque", desc: "Landmark national mosque at the foot of the Margalla Hills.", img: "mosque.jpg" },
  { name: "Daman-e-Koh", desc: "Hilltop viewpoint with wide views over Islamabad.", img: "daman-e-koh.jpg" },
  { name: "Saidpur Village", desc: "Restored historic village with craft shops and restaurants.", img: "saidpur.jpg" }
];

const count = (s, c) => [...s].filter(x => x === c).length;
PLACES.forEach(p => {
  if (!p.audit) return;
  const a = p.audit.replace(/ /g, ""), y = count(a, "Y"), n = count(a, "N"), raw = y / (y + n) * 100;
  let r = raw >= 85 ? 0 : raw >= 65 ? 1 : raw >= 40 ? 2 : 3;
  if ((a[0] === "N" || a[6] === "N") && r < 2) r = 2; // critical rule: A1 or B1 = No caps rating at Partly
  p.ev = { a, pct: Math.round(raw), r };
});

const grid = document.getElementById("grid");
if (grid) {
  const q = document.getElementById("q"), empty = document.getElementById("empty"),
    dlg = document.getElementById("modal"), body = document.getElementById("m-body");
  const search = document.getElementById("search"), featuredOnly = grid.dataset.featured === "1";

  const card = (p, i) => `<li><button class="card" type="button" data-i="${i}" aria-haspopup="dialog"><span class="thumb"><img src="${p.img}" alt="" loading="lazy" onerror="this.remove()"></span><span class="card-name">${p.name}</span><span class="card-desc">${p.desc}</span><span class="card-score">Accessibility score: ${p.ev ? p.ev.pct + "%" : "Pending"}</span></button></li>`;

  function render() {
    const t = q ? q.value.trim().toLowerCase() : "";
    const list = PLACES.map((p, i) => [p, i]).filter(([p]) =>
      (!featuredOnly || p.ev) && (p.name + " " + p.desc).toLowerCase().includes(t));
    grid.innerHTML = list.map(([p, i]) => card(p, i)).join("");
    if (empty) empty.hidden = list.length > 0;
  }

  function openPlace(i) {
    const p = PLACES[i], e = p.ev;
    let h = `<div class="m-top"><div class="thumb"><img src="${p.img}" alt="${p.name}" onerror="this.remove()"></div><div><h2 id="m-title">${p.name}</h2><p>${p.desc}</p><p class="m-score">Accessibility score: ${e ? e.pct + "%" : "Pending"}${e ? `<span class="chip r${e.r}">${RATINGS[e.r]}</span>` : ""}</p></div></div>`;
    h += e ? `<div class="m-details">${SECTIONS.map(([title, items], s) => {
      const a = e.a.slice(s * 6, s * 6 + 6), y = count(a, "Y"), d = y + count(a, "N");
      return `<details><summary><span>${title}</span><span>Score: ${d ? y + "/" + d : "N/A"}</span></summary><ul>${items.map((x, k) => `<li><span>${x}</span><span class="chip ${a[k]}">${LABEL[a[k]]}</span></li>`).join("")}</ul></details>`;
    }).join("")}</div>` : "<p>This place hasn’t been audited yet. Check back soon.</p>";
    body.innerHTML = h;
    dlg.showModal();
    document.body.style.overflow = "hidden";
  }

  if (q) {
    q.value = new URLSearchParams(window.location.search).get("q") || "";
    q.addEventListener("input", render);
  }
  if (search) search.addEventListener("submit", e => e.preventDefault());
  grid.addEventListener("click", e => { const b = e.target.closest(".card"); if (b) openPlace(+b.dataset.i); });
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  dlg.querySelector(".close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("close", () => { document.body.style.overflow = ""; });
  render();
}
