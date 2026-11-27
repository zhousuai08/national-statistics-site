// World in Numbers — the five views. Every number comes from data.js, which
// was fetched from the World Bank; nothing here is invented or placeholder.

import { COUNTRIES, INDICATORS, REGIONS, SOURCE_NOTE } from "./data.js";
import { byCode, ind, fmtValue, fmtShort, median, rankOf } from "./main.js";
import { barList, columnChart, esc } from "./charts.js";

function countryLink(c) {
  return `#/country/${c.code}`;
}

function sum(key) {
  return COUNTRIES.reduce((a, c) => a + c[key], 0);
}

function topBy(key, n, desc = true) {
  return [...COUNTRIES].sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key]).slice(0, n);
}

function countryCard(c) {
  return `<a class="country-card" href="${countryLink(c)}">
    <h3>${esc(c.name)}</h3>
    <p class="region">${esc(c.region)} · ${esc(c.code)}</p>
    <dl>
      <dt>Population</dt><dd>${fmtShort("pop", c.pop)}</dd>
      <dt>GDP per capita</dt><dd>${fmtValue("gdppc", c.gdppc)}</dd>
      <dt>Life expectancy</dt><dd>${fmtValue("life", c.life)}</dd>
      <dt>GDP growth</dt><dd>${fmtValue("growth", c.growth)}</dd>
    </dl></a>`;
}

export function renderHome() {
  const totalPop = sum("pop");
  const totalGdp = sum("gdp");
  const medLife = median(COUNTRIES.map((c) => c.life));
  const medGdppc = median(COUNTRIES.map((c) => c.gdppc));
  const popRows = topBy("pop", 6).map((c) => ({
    label: c.name, href: countryLink(c), value: c.pop, display: fmtShort("pop", c.pop),
  }));
  const richRows = topBy("gdppc", 6).map((c) => ({
    label: c.name, href: countryLink(c), value: c.gdppc, display: fmtShort("gdppc", c.gdppc),
  }));
  const lifeRows = topBy("life", 6).map((c) => ({
    label: c.name, href: countryLink(c), value: c.life, display: fmtValue("life", c.life),
  }));
  return `
  <section class="hero">
    <h1>The world, counted: 24 countries in 12 numbers</h1>
    <p class="lede">Population, money, health, work and energy for the countries where
    most of humanity lives — every figure from the World Bank, every figure dated.
    Pick a country, rank them all, or put four side by side.</p>
  </section>
  <section class="stat-strip" aria-label="World totals for the 24 countries">
    <div class="stat"><b>${COUNTRIES.length}</b><span>countries covered</span></div>
    <div class="stat"><b>${(totalPop / 1e9).toFixed(2)}bn</b><span>people live in them</span></div>
    <div class="stat"><b>$${(totalGdp / 1000).toFixed(1)}tn</b><span>combined GDP, 2024</span></div>
    <div class="stat"><b>${medLife.toFixed(1)} yrs</b><span>median life expectancy</span></div>
  </section>
  <div class="cards">
    <section class="card">
      <h2><a href="#/rankings">Largest populations</a></h2>
      ${barList(popRows, { note: "India passed China as the world's most populous country. All figures 2024." })}
    </section>
    <section class="card">
      <h2><a href="#/rankings">Richest per person</a></h2>
      ${barList(richRows, { note: "GDP per capita, current US$, 2024. The United States is more than 120× DR Congo." })}
    </section>
    <section class="card">
      <h2><a href="#/rankings">Longest lives</a></h2>
      ${barList(lifeRows, { note: "Life expectancy at birth, 2024. Japan leads at 84.0 years; Nigeria is lowest at 54.6." })}
    </section>
    <section class="card">
      <h2><a href="#/compare">One chart, four countries</a></h2>
      ${columnChart(
        [byCode.USA, byCode.CHN, byCode.IND, byCode.JPN].map((c) => ({
          short: c.code, value: c.gdppc, display: fmtShort("gdppc", c.gdppc),
        })), { label: "GDP per capita, 2024" })}
      <p class="bar-note">GDP per capita, current US$, 2024. Compare any four countries on the
      <a href="#/compare">Compare page</a> — all twelve indicators, side by side.</p>
    </section>
  </div>
  <h2>All 24 countries</h2>
  <p class="muted">Median GDP per capita across the 24 is $${Math.round(medGdppc).toLocaleString("en-US")}.
  Click any country for its full profile.</p>
  <div class="grid">${COUNTRIES.map(countryCard).join("")}</div>
  <p class="small muted" style="margin-top:16px">${esc(SOURCE_NOTE)}</p>`;
}

export function renderRankings(selected = "pop", sortKey = null, sortDir = "desc") {
  const meta = ind(selected);
  const key = sortKey ?? selected;
  const dir = sortKey ? sortDir : "desc";
  const sorted = [...COUNTRIES].sort((a, b) => {
    if (typeof a[key] === "string") {
      return dir === "desc" ? b[key].localeCompare(a[key]) : a[key].localeCompare(b[key]);
    }
    const d = (a[key] - b[key]) * (dir === "desc" ? -1 : 1);
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });
  const options = INDICATORS.map((i) =>
    `<option value="${i.key}"${i.key === selected ? " selected" : ""}>${esc(i.label)} (${i.year})</option>`).join("");
  const top = topBy(selected, 5);
  const bottom = topBy(selected, 5, false);
  const head = (k, label) =>
    `<th data-sort="${k}"><button type="button">${esc(label)}${key === k ? (dir === "desc" ? " ▼" : " ▲") : ""}</button></th>`;
  return `
  <section class="hero">
    <h1>Rankings — all 24 countries, every indicator</h1>
    <p class="lede">Click any column heading to sort. The highlighted column is the one
    you picked below; the table always shows population, GDP per capita and life
    expectancy alongside it.</p>
  </section>
  <div class="field">
    <label for="rank-indicator">Rank countries by</label>
    <select id="rank-indicator">${options}</select>
  </div>
  <p><strong>Top 5 by ${esc(meta.label)}:</strong>
    ${top.map((c) => `<a href="${countryLink(c)}">${esc(c.name)}</a> (${fmtValue(selected, c[selected])})`).join(" · ")}<br>
    <strong>Bottom 5:</strong>
    ${bottom.map((c) => `<a href="${countryLink(c)}">${esc(c.name)}</a> (${fmtValue(selected, c[selected])})`).join(" · ")}</p>
  <div class="table-wrap">
  <table class="data" id="rank-table" data-sorted="${key}:${dir}">
    <thead><tr>
      <th>#</th>${head("name", "Country")}<th>Region</th>
      ${head(selected, meta.label + " (" + meta.year + ")")}
      ${head("pop", "Population")}${head("gdppc", "GDP / capita")}${head("life", "Life exp.")}
    </tr></thead>
    <tbody>
    ${sorted.map((c, i) => `<tr>
      <td class="rank-num">${i + 1}</td>
      <td><a href="${countryLink(c)}"><strong>${esc(c.name)}</strong></a></td>
      <td>${esc(c.region)}</td>
      <td><strong>${fmtValue(selected, c[selected])}</strong></td>
      <td>${fmtShort("pop", c.pop)}</td>
      <td>${fmtValue("gdppc", c.gdppc)}</td>
      <td>${fmtValue("life", c.life)}</td>
    </tr>`).join("")}
    </tbody>
  </table>
  </div>
  <p class="small muted" style="margin-top:10px">${esc(meta.label)}: ${esc(meta.unit)}, ${meta.year}.
  ${esc(SOURCE_NOTE)}</p>`;
}

export function renderCompare() {
  const hash = location.hash.replace(/^#\/?compare\/?/, "");
  let picked = hash ? hash.split(",").map((s) => s.toUpperCase()).filter((c) => byCode[c]) : [];
  if (picked.length < 2) picked = ["USA", "CHN", "IND", "JPN"];
  picked = [...new Set(picked)].slice(0, 4);
  const countries = picked.map((c) => byCode[c]);
  const boxes = COUNTRIES.map((c) =>
    `<label><input type="checkbox" value="${c.code}"${picked.includes(c.code) ? " checked" : ""}> ${esc(c.name)}</label>`).join("");
  const rows = INDICATORS.map((meta) => {
    const vals = countries.map((c) => c[meta.key]);
    const best = meta.higherBetter === true ? Math.max(...vals)
      : meta.higherBetter === false ? Math.min(...vals) : null;
    const worst = meta.higherBetter === true ? Math.min(...vals)
      : meta.higherBetter === false ? Math.max(...vals) : null;
    return `<tr><th scope="row" style="text-align:left">${esc(meta.label)} <span class="muted small">(${meta.year})</span></th>` +
      countries.map((c) => {
        const cls = c[meta.key] === best ? ' class="best"' : c[meta.key] === worst ? ' class="worst"' : "";
        return `<td${cls}>${fmtValue(meta.key, c[meta.key])}</td>`;
      }).join("") + "</tr>";
  }).join("");
  const chartRows = countries.map((c, i) => ({
    short: c.code, value: c.gdppc, display: fmtShort("gdppc", c.gdppc), amber: i === 0,
  }));
  return `
  <section class="hero">
    <h1>Compare countries, side by side</h1>
    <p class="lede">Tick two to four countries. Every indicator lines up in one table, so
    the gaps are easy to see. Green is the best of the picked countries, red the
    worst — only where “best” means something (for population there is no best).</p>
  </section>
  <div class="compare-pick">${boxes}</div>
  <p class="small muted">Comparing: ${countries.map((c) => `<a href="${countryLink(c)}">${esc(c.name)}</a>`).join(" · ")}</p>
  <div class="table-wrap">
  <table class="data compare">
    <thead><tr><th style="text-align:left">Indicator</th>${countries.map((c) => `<th><a href="${countryLink(c)}">${esc(c.name)}</a></th>`).join("")}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  </div>
  <p class="legend"><b class="good">Green</b> = best of the picked countries · <b class="bad">Red</b> = worst · Units in the indicator names. ${esc(SOURCE_NOTE)}</p>
  <h2>GDP per capita, compared</h2>
  <div class="card">${columnChart(chartRows, { label: "GDP per capita, current US$, 2024" })}
  <p class="bar-note">GDP per capita, current US$, 2024. The richest of the picked countries
  earns about ${Math.round(Math.max(...countries.map((c) => c.gdppc)) / Math.min(...countries.map((c) => c.gdppc)))}× the poorest — check the table for the exact figures.</p></div>`;
}

export function renderCountry(c) {
  const maxByKey = {};
  INDICATORS.forEach((meta) => { maxByKey[meta.key] = Math.max(...COUNTRIES.map((x) => x[meta.key])); });
  const cards = INDICATORS.map((meta) => {
    const v = c[meta.key];
    const rank = rankOf(meta.key, c.code, meta.higherBetter !== false);
    const rankText = meta.higherBetter === null
      ? `No. ${rank} of 24 by size`
      : (meta.higherBetter ? `No. ${rank} of 24 (highest is best)` : `No. ${rank} of 24 (lowest is best)`);
    const pct = Math.max(2, Math.min(100, (v / maxByKey[meta.key]) * 100));
    return `<div class="kv">
      <h3>${esc(meta.label)}</h3>
      <div class="v">${fmtValue(meta.key, v)} <small>${esc(meta.unit)}</small></div>
      <div class="rank">${rankText} · ${meta.year}</div>
      <div class="meter"><i class="${meta.key === "gdppc" || meta.key === "life" ? "" : "amber"}" style="width:${pct.toFixed(1)}%"></i></div>
    </div>`;
  }).join("");
  const neighbours = COUNTRIES.filter((x) => x.region === c.region && x.code !== c.code);
  const lifeRows = [c, ...neighbours].slice(0, 6).map((x) => ({
    label: x.name, href: countryLink(x), value: x.life, display: fmtValue("life", x.life),
    amber: x.code === c.code,
  }));
  return `
  <section class="hero">
    <p class="muted" style="margin-bottom:2px"><a href="#/">Dashboard</a> · ${esc(c.region)}</p>
    <h1>${esc(c.name)}</h1>
    <p class="lede">All twelve indicators for ${esc(c.name)}, each with its rank among the
    24 countries and its year. The bars show each figure against the highest in the set.</p>
  </section>
  <div class="kv-grid">${cards}</div>
  <div class="cards">
    <section class="card">
      <h2>Life expectancy in ${esc(c.region)}</h2>
      ${barList(lifeRows, { note: "Life expectancy at birth, years, 2024. " + esc(c.name) + " is highlighted." })}
    </section>
    <section class="card">
      <h2>More from ${esc(c.region)}</h2>
      <p>Other countries in the same region:</p>
      <p>${neighbours.map((x) => `<a href="${countryLink(x)}">${esc(x.name)}</a> (${fmtShort("pop", x.pop)})`).join(" · ")}</p>
      <p>Or <a href="#/compare">compare ${esc(c.name)}</a> with up to three others, indicator by indicator.</p>
    </section>
  </div>
  <p class="small muted" style="margin-top:16px">${esc(SOURCE_NOTE)}</p>`;
}

export function renderAbout() {
  const rows = INDICATORS.map((i) =>
    `<tr><td style="text-align:left">${esc(i.label)}</td><td style="text-align:left">${esc(i.unit)}</td><td>${i.year}</td></tr>`).join("");
  return `
  <section class="hero">
    <h1>Sources &amp; method</h1>
    <p class="lede">This site is only as good as its figures, so here is exactly where they
    came from and what was done to them.</p>
  </section>
  <h2>Where the numbers come from</h2>
  <p>Every figure is from the World Bank's <strong>World Development Indicators</strong>
  (WDI), fetched on 27 November 2026 from the public API at
  <span class="muted">api.worldbank.org/v2</span> — no key, no scraping, no estimates
  of our own. For each country and indicator we took the latest non-null value
  published for 2018–2024. The fetch script and the full source log are kept with
  the project; the numbers in the site were checked cell by cell against the API
  dump (288 cells, no mismatches).</p>
  <h2>The twelve indicators</h2>
  <div class="table-wrap"><table class="data">
    <thead><tr><th style="text-align:left">Indicator</th><th style="text-align:left">Unit</th><th>Year</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <h2>What to watch out for</h2>
  <ul>
    <li><strong>Renewable energy is 2021</strong> — the latest year the World Bank
    publishes for that indicator. Everything else is 2024.</li>
    <li><strong>GDP is in current US dollars</strong>, not purchasing-power parity.
    That is why the gaps look so wide; a PPP view would narrow them.</li>
    <li><strong>Unemployment is the ILO modelled estimate</strong>, as the World Bank
    publishes it. It counts people actively looking for work, so it misses much
    informal work — most visibly in South Africa, at 32.3%.</li>
    <li><strong>Nigeria's life expectancy (54.6 years)</strong> is the lowest in the
    set and fell in recent years; it is the published figure, not a mistake.</li>
    <li><strong>Ranks are among these 24 countries only</strong> — the world's largest
    and most talked-about, not all 200-plus. A No. 1 here is not a world No. 1.</li>
  </ul>
  <h2>About this site</h2>
  <p>World in Numbers is a static site: plain HTML, CSS and JavaScript, no build
  step, no network requests, no tracking. It runs from its own files on a desktop
  and on a phone. The design, text and charts are original.</p>
  <p><a class="btn" href="#/">Explore the dashboard</a></p>`;
}
