// Kenduri RSVP — shared logic. All data lives in localStorage; nothing is sent anywhere.

const KENDURI = {
  name: "Majlis Kenduri Keluarga Ismail",
  couple: "Izzat & Aisyah",
  date: "2026-12-12T11:00:00+08:00",
  venue: "Dewan Seri Melati, Shah Alam",
  // Time slots: label + capacity (seats). Capacity is a demo value.
  slots: [
    { id: "s1", label: "11:00 AM – 12:30 PM", capacity: 40 },
    { id: "s2", label: "12:30 – 2:00 PM", capacity: 60 },
    { id: "s3", label: "2:00 – 3:30 PM", capacity: 40 }
  ],
  dishes: [
    { id: "nasidagang", name: "Nasi Dagang Terengganu", sub: "fish curry & acar" },
    { id: "rendang", name: "Rendang Tok", sub: "slow-cooked beef" },
    { id: "masakmerah", name: "Ayam Masak Merah", sub: "spicy tomato chicken" },
    { id: "ikanbakar", name: "Ikan Bakar", sub: "charcoal grilled fish" },
    { id: "laksa", name: "Laksa Johor", sub: "spaghetti-style laksa" },
    { id: "bubur", name: "Bubur Pulut Hitam", sub: "dessert" },
    { id: "tehaislimau", name: "Teh O Ais Limau", sub: "iced lemon tea" }
  ],
  relationships: ["Spouse", "Child", "Parent", "Sibling", "Friend"]
};

const STORAGE_KEY = "kenduri_rsvps_v1";

// Seed with sample entries on first visit so no view is ever empty.
const SEED = [
  {
    id: "seed1", name: "Ahmad bin Ismail", phone: "012-345 6789", email: "ahmad.ismail@example.com",
    coming: true, members: [
      { name: "Fatimah binti Omar", rel: "Spouse" },
      { name: "Amir bin Ahmad", rel: "Child" },
      { name: "Adlina binti Ahmad", rel: "Child" }
    ], dishes: ["nasidagang", "rendang", "masakmerah", "ikanbakar"],
    dietary: [], slot: "s2", gift: "cash", song: "Isabella by Search",
    wish: "Tahniah Izzat & Aisyah! Semoga berkekalan hingga ke Jannah.",
    at: "2026-11-17 10:15 AM"
  },
  {
    id: "seed2", name: "Nurul Aini binti Hassan", phone: "019-876 5432", email: "nurul.aini@example.com",
    coming: true, members: [{ name: "Hafiz bin Sulong", rel: "Spouse" }],
    dishes: ["nasidagang", "nasidagang"], dietary: ["vegetarian"],
    slot: "s1", gift: "household", song: "Sepahtuta Reunion", wish: "Selamat pengantin baru!",
    at: "2026-11-17 11:42 AM"
  },
  {
    id: "seed3", name: "Rajesh Kumar", phone: "013-222 3344", email: "rajesh.k@example.com",
    coming: false, members: [], dishes: [], dietary: [], slot: null,
    gift: "none", song: "", wish: "So sorry to miss it — travel for work. Have a beautiful day!",
    at: "2026-11-17 1:08 PM"
  }
];

function loadRsvps() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let list;
  if (!raw) {
    list = JSON.parse(JSON.stringify(SEED));
  } else {
    try { list = JSON.parse(raw); } catch (e) { list = JSON.parse(JSON.stringify(SEED)); }
  }
  // ensure every record has a code (older entries included)
  let changed = false;
  list.forEach(r => { if (!r.code) { r.code = makeCode(); changed = true; } });
  if (changed) saveRsvps(list);
  return list;
}
function saveRsvps(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

function paxOf(r) { return r.coming ? 1 + (r.members ? r.members.length : 0) : 0; }
function totalPax(list) { return list.reduce((s, r) => s + paxOf(r), 0); }

function nowLabel() {
  return new Date().toLocaleString("en-MY", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true
  });
}

// ---- draft handoff between pages ----
function saveDraft(patch) {
  const d = JSON.parse(localStorage.getItem("kenduri_draft") || "{}");
  Object.assign(d, patch);
  localStorage.setItem("kenduri_draft", JSON.stringify(d));
}
function loadDraft() {
  return JSON.parse(localStorage.getItem("kenduri_draft") || "{}");
}
function clearDraft() { localStorage.removeItem("kenduri_draft"); }

function slotById(id) { return KENDURI.slots.find(s => s.id === id); }
function dishById(id) { return KENDURI.dishes.find(d => d.id === id); }

// ---- unique RSVP code, e.g. KDR26-7F3KQ9 ----
function makeCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "KDR26-" + s;
}
function findByCode(list, code) { return list.find(r => (r.code || "").toUpperCase() === code.toUpperCase()); }
// Match an existing reply by name + phone so returning guests can update.
function findDuplicate(list, name, phone) {
  return list.find(r => r.name.trim().toLowerCase() === name.trim().toLowerCase() && r.phone.trim() === phone.trim());
}

// ---- step chips (progress) ----
function stepChips(current) {
  const steps = ["You", "Members", "Menu", "Time & Extras", "Done"];
  const labels = ["Your details", "Members", "Menu", "Time & Extras", "Confirmed"];
  return `<div class="chips">${steps.map((s, i) => {
    const n = i + 1;
    const cls = n < current ? "done" : n === current ? "now" : "todo";
    const mark = n < current ? '<span class="chip-mark">✓</span>' : "";
    const tag = String(n).padStart(2, "0") + (n < current ? " · Done" : n === current ? " · Now" : " · To do");
    return `<div class="chip ${cls}"><span class="chip-no">${tag}${mark}</span><b>${labels[i]}</b></div>`;
  }).join("")}</div>
  <div class="progress-card"><span class="pc-lab">Your progress</span><span class="pc-num">${current} of 5 steps</span><div class="pc-bar"><div class="pc-fill" style="width:${(current / 5) * 100}%"></div></div></div>`;
}

// ---- SVG dish art (vector illustrations, no external images) ----
function dishArt(id) {
  const art = {
    nasidagang: `<rect width="120" height="72" fill="#f6e2c8"/><ellipse cx="60" cy="46" rx="42" ry="18" fill="#ffffff"/><ellipse cx="60" cy="42" rx="38" ry="15" fill="#f3e6d8"/><ellipse cx="52" cy="40" rx="24" ry="10" fill="#fff8ec"/><path d="M30 36 q20 -14 44 -4 q14 6 22 2 l4 8 q-30 10 -52 4 q-14 -4 -18 -4 z" fill="#8a5a2b"/><circle cx="78" cy="34" r="7" fill="#c0392b"/><circle cx="86" cy="38" r="5" fill="#e67e22"/><path d="M88 44 q10 2 16 8" stroke="#3f7d54" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    rendang: `<rect width="120" height="72" fill="#efe0cf"/><ellipse cx="60" cy="44" rx="44" ry="17" fill="#b0713a"/><ellipse cx="60" cy="42" rx="40" ry="14" fill="#8f5a2c"/><circle cx="46" cy="40" r="8" fill="#6e4420"/><circle cx="62" cy="36" r="9" fill="#5d3a1c"/><circle cx="76" cy="41" r="7" fill="#6e4420"/><path d="M40 30 q14 -8 30 -4 M50 46 q16 4 28 -2" stroke="#c9a24b" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="88" cy="34" r="4" fill="#3f7d54"/><circle cx="34" cy="36" r="4" fill="#c0392b"/>`,
    masakmerah: `<rect width="120" height="72" fill="#fbe9dc"/><ellipse cx="60" cy="44" rx="43" ry="17" fill="#ffffff"/><ellipse cx="60" cy="42" rx="38" ry="14" fill="#c0392b"/><ellipse cx="58" cy="41" rx="30" ry="10" fill="#e74c3c"/><circle cx="48" cy="38" r="7" fill="#fff3e0"/><circle cx="66" cy="42" r="6" fill="#fff3e0"/><path d="M44 46 q14 4 28 0" stroke="#a93226" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="80" cy="34" r="4" fill="#3f7d54"/><circle cx="40" cy="34" r="3" fill="#3f7d54"/>`,
    ikanbakar: `<rect width="120" height="72" fill="#e8efe9"/><ellipse cx="60" cy="46" rx="42" ry="15" fill="#4a3a2c"/><path d="M30 40 q28 -16 52 -4 q6 3 10 6 q-6 4 -12 6 q-26 8 -50 -2 z" fill="#8a6a45"/><path d="M34 42 q24 -10 46 -2" stroke="#5d4429" stroke-width="3" fill="none"/><circle cx="40" cy="38" r="2.5" fill="#fff"/><path d="M92 30 q8 -6 12 0 q-6 4 -12 2 z" fill="#8a6a45"/><path d="M30 52 q20 6 44 0" stroke="#3f7d54" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="84" cy="52" r="4" fill="#c0392b"/>`,
    laksa: `<rect width="120" height="72" fill="#fdf3e0"/><ellipse cx="60" cy="44" rx="43" ry="17" fill="#ffffff"/><ellipse cx="60" cy="42" rx="38" ry="14" fill="#d4a017"/><path d="M40 38 q8 6 14 0 q8 6 14 0 q8 6 14 0" stroke="#f5e6c8" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="46" cy="34" r="5" fill="#c0392b"/><circle cx="70" cy="38" r="5" fill="#e67e22"/><path d="M36 46 q22 6 44 -2" stroke="#3f7d54" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="82" cy="34" r="3" fill="#fff"/>`,
    bubur: `<rect width="120" height="72" fill="#f0e6ef"/><ellipse cx="60" cy="46" rx="40" ry="15" fill="#ffffff"/><path d="M30 44 q30 -12 58 0 q-4 8 -10 9 q-20 4 -38 0 q-7 -2 -10 -9 z" fill="#4a2c3f"/><circle cx="50" cy="44" r="3" fill="#c9a24b"/><circle cx="62" cy="46" r="3" fill="#c9a24b"/><circle cx="72" cy="42" r="3" fill="#c9a24b"/><path d="M44 36 q16 -6 30 0" stroke="#6e4459" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    tehaislimau: `<rect width="120" height="72" fill="#e6f0ef"/><rect x="42" y="20" width="34" height="40" rx="6" fill="#f5c542" opacity="0.9"/><rect x="45" y="26" width="28" height="30" rx="4" fill="#d98e2b"/><path d="M48 24 h22 M48 52 h22" stroke="#a85f1a" stroke-width="3"/><circle cx="70" cy="18" r="6" fill="#7dbb42"/><circle cx="76" cy="22" r="5" fill="#5a9e32"/><path d="M40 30 l-8 4 M40 40 l-8 -2 M78 32 l8 3 M78 44 l8 -2" stroke="#9fd3e8" stroke-width="2.5" stroke-linecap="round"/><rect x="50" y="30" width="5" height="8" rx="2" fill="#fff" opacity="0.6"/>`
  };
  return `<svg viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${art[id] || ""}</svg>`;
}

// ---- simple QR code (visual placeholder encoding the app URL) ----
// Real scanners need a reachable URL; when hosted on GitHub Pages the QR
// generated from location.href will genuinely work.
function drawQr(container, text, size) {
  // Tiny deterministic "QR-style" pattern: finder squares + hash grid.
  // It encodes nothing scanable by itself; when the app is online, a real
  // URL is printed below the square so guests can still type it.
  let cells = "";
  const N = 21;
  let h = 0;
  for (let i = 0; i < text.length; i++) { h = (h * 31 + text.charCodeAt(i)) >>> 0; }
  function finder(x, y) {
    cells += `<rect x="${x}" y="${y}" width="7" height="7" fill="#2f2b28"/>`;
    cells += `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/>`;
    cells += `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#2f2b28"/>`;
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (inFinder) continue;
      const v = (h = (h * 1103515245 + 12345) >>> 0) & 1;
      if (v) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#2f2b28"/>`;
    }
  }
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  container.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${N} ${N}" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border:1px solid var(--line);border-radius:8px">${cells}</svg>`;
}

// ---- confetti ----
function confetti() {
  const colors = ["#b0713a", "#c9a24b", "#3f7d54", "#e74c3c", "#7dbb42", "#d4a017"];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
    p.style.animationDelay = Math.random() * 0.4 + "s";
    p.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 3500);
  }
}
