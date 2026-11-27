// World in Numbers — router and shared formatting. Views live in views.js;
// this file wires the hash routes, the search box and the nav highlight.

import { COUNTRIES, INDICATORS } from "./data.js";
import { renderHome, renderRankings, renderCompare, renderCountry, renderAbout } from "./views.js";

export const byCode = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

export function ind(key) {
  return INDICATORS.find((i) => i.key === key);
}

const nfInt = new Intl.NumberFormat("en-US");
const nf1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmtValue(key, v) {
  const meta = ind(key);
  if (v === null || v === undefined) return "—";
  switch (meta.fmt) {
    case "int": return nfInt.format(Math.round(v));
    case "money1": return "$" + nf1.format(v) + "bn";
    case "money0": return "$" + nfInt.format(Math.round(v));
    case "pct1": return nf1.format(v) + "%";
    case "dec1": return nf1.format(v);
    case "dec2": return nf2.format(v);
    default: return String(v);
  }
}

// Short display for charts: 1.41bn people, $29.3tn GDP, 84.0 yrs…
export function fmtShort(key, v) {
  if (v === null || v === undefined) return "—";
  if (key === "pop") return (v / 1e9 >= 1 ? nf1.format(v / 1e9) + "bn" : nfInt.format(Math.round(v / 1e6)) + "m");
  if (key === "gdp") return "$" + nf1.format(v / 1000) + "tn";
  if (key === "gdppc") return "$" + nfInt.format(Math.round(v / 1000)) + "k";
  return fmtValue(key, v);
}

export function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function rankOf(key, code, higherIsTop = true) {
  const sorted = [...COUNTRIES].sort((a, b) => higherIsTop ? b[key] - a[key] : a[key] - b[key]);
  return sorted.findIndex((c) => c.code === code) + 1;
}

function setActiveNav(route) {
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const name = a.getAttribute("data-nav");
    a.classList.toggle("active",
      (route === "home" && name === "home") ||
      (route === "rankings" && name === "rankings") ||
      (route === "compare" && name === "compare") ||
      (route === "about" && name === "about"));
  });
}

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [page, arg] = hash.split("/");
  const app = document.getElementById("app");
  window.scrollTo(0, 0);
  if (page === "" || page === "home") { setActiveNav("home"); app.innerHTML = renderHome(); }
  else if (page === "rankings") { setActiveNav("rankings"); app.innerHTML = renderRankings(); bindRankings(); }
  else if (page === "compare") { setActiveNav("compare"); app.innerHTML = renderCompare(); bindCompare(); }
  else if (page === "country" && byCode[(arg ?? "").toUpperCase()]) {
    setActiveNav(""); app.innerHTML = renderCountry(byCode[arg.toUpperCase()]);
  } else if (page === "about") { setActiveNav("about"); app.innerHTML = renderAbout(); }
  else { setActiveNav("home"); app.innerHTML = renderHome(); }
}

// Rankings page controls: indicator picker + clickable column sort.
function bindRankings() {
  const sel = document.getElementById("rank-indicator");
  if (sel) sel.addEventListener("change", () => {
    document.getElementById("app").innerHTML = renderRankings(sel.value);
    bindRankings();
  });
  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.querySelector("button").addEventListener("click", () => {
      const key = th.getAttribute("data-sort");
      const cur = document.getElementById("rank-table").getAttribute("data-sorted");
      const dir = cur === key + ":asc" ? "desc" : "asc";
      document.getElementById("app").innerHTML = renderRankings(
        document.getElementById("rank-indicator")?.value ?? "pop", key, dir);
      bindRankings();
    });
  });
}

// Compare page: ticking a country re-renders the comparison table.
function bindCompare() {
  document.querySelectorAll(".compare-pick input").forEach((box) => {
    box.addEventListener("change", () => {
      const picked = [...document.querySelectorAll(".compare-pick input:checked")]
        .map((b) => b.value);
      if (picked.length < 2) return;
      if (picked.length > 4) { box.checked = false; return; }
      location.hash = "#/compare/" + picked.join(",");
    });
  });
}

// Search: jump to the first country whose name matches, else the dashboard.
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("search-box").value.trim().toLowerCase();
  if (!q) return;
  const hit = COUNTRIES.find((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q);
  location.hash = hit ? "#/country/" + hit.code : "#/";
  document.getElementById("search-box").value = "";
});

window.addEventListener("hashchange", route);
route();
