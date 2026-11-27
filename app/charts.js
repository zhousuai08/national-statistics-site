// World in Numbers — small chart helpers. Plain SVG bars, no library, so the
// first load stays tiny. Every chart is drawn from the same data the tables show.

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Horizontal bar list: rows are { label, href, value, display, amber? }.
// max defaults to the largest value; pass max: 100 for percentages.
export function barList(rows, opts = {}) {
  const max = opts.max ?? Math.max(...rows.map((r) => r.value), 1);
  const items = rows.map((r) => {
    const pct = Math.max(0.5, Math.min(100, (r.value / max) * 100));
    const label = r.href
      ? `<a href="${esc(r.href)}">${esc(r.label)}</a>`
      : esc(r.label);
    return `<div class="bar-row"><span class="bar-label">${label}</span>` +
      `<span class="bar-track"><span class="bar-fill${r.amber ? " amber" : ""}" style="display:block;width:${pct.toFixed(1)}%"></span></span>` +
      `<span class="bar-val">${esc(r.display)}</span></div>`;
  }).join("");
  return `<div class="bars">${items}</div>` +
    (opts.note ? `<p class="bar-note">${esc(opts.note)}</p>` : "");
}

// Compact SVG column chart for one indicator across a few countries.
// Returns an inline SVG with labelled bars.
export function columnChart(rows, opts = {}) {
  const W = opts.width ?? 520, H = opts.height ?? 190, padB = 34, padT = 12;
  const max = opts.max ?? Math.max(...rows.map((r) => r.value), 1);
  const n = rows.length;
  const slot = W / n, bw = Math.min(56, slot * 0.55);
  const y = (v) => padT + (H - padB - padT) * (1 - v / max);
  let bars = "";
  rows.forEach((r, i) => {
    const x = slot * i + (slot - bw) / 2;
    const h = Math.max(2, (H - padB - padT) * (r.value / max));
    bars += `<rect x="${x.toFixed(1)}" y="${y(r.value).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${r.amber ? "#b45309" : "#0f766e"}"/>` +
      `<text x="${(x + bw / 2).toFixed(1)}" y="${(y(r.value) - 5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#16242e">${esc(r.display)}</text>` +
      `<text x="${(x + bw / 2).toFixed(1)}" y="${H - 12}" text-anchor="middle" font-size="11" fill="#5b6b76">${esc(r.short)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(opts.label ?? "Bar chart")}">${bars}</svg>`;
}
