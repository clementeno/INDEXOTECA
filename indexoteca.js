/**
 * Indexoteca — Filtro, orden, filas clickeables, preview drawer.
 * Buscador y contador viven en toolbar (no en header).
 */

const studios = [
  { name: "Felicidad Pública", url: "https://felicidadpublica.cl", field: "Dirección Creativa / Branding / Editorial", city: "Santiago, Chile", tags: ["branding", "identidad", "editorial"], previews: ["felicidad-1", "felicidad-2", "felicidad-3", "felicidad-4"] },
  { name: "Otros Pérez", url: "http://otrosperez.com/", field: "Branding / Editorial / Campañas", city: "Santiago, Chile", tags: ["identidad", "editorial", "gráfico"], previews: ["otrosperez-1", "otrosperez-2", "otrosperez-3"] },
  { name: "Gaggeroworks", url: "http://gaggeroworks.co.uk/", field: "Dirección Creativa / Diseño Gráfico / Museografía", city: "London, UK", tags: ["direction", "graphic", "art"], previews: ["gaggero-1", "gaggero-2", "gaggero-3", "gaggero-4"] },
  { name: "Estudio Postal", url: "https://www.estudiopostal.cl/", field: "Branding / Packaging / Corporativo / Editorial", city: "Santiago, Chile", tags: ["branding", "packaging", "identidad"], previews: ["postal-1", "postal-2", "postal-3"] },
  { name: "10:10", url: "https://www.diezdiez.com/", field: "Digital / Web", city: "Santiago, Chile", tags: ["digital", "web", "experiencia"], previews: ["diezdiez-1", "diezdiez-2", "diezdiez-3", "diezdiez-4"] },
  { name: "Design Systems International", url: "https://designsystems.international/", field: "Design Systems / Digital / Multidisciplinario", city: "International", tags: ["design systems", "digital", "product"], previews: ["dsi-1", "dsi-2", "dsi-3"] },
  { name: "JVD", url: "#", field: "Dirección de arte / Arquitectura", city: "Santiago, Chile", tags: ["dirección de arte", "arquitectura", "gráfico"], previews: ["jvd-1", "jvd-2", "jvd-3"] },
  { name: “iv Studio”, url: "https://www.ivestudio.com", field: “Branding / Dirección Creativa”, city: "Santiago, Chile", tags: ["dirección de arte", “era”nding, "gráfico"], previews: ["iv-1.avif", "iv-2.avif", "iv-3.avif"] },
];

let filtered = [...studios];
let sortKey = "name";
let sortDir = 1;

const tableBody = document.getElementById("table-body");
const searchInput = document.getElementById("search-input");
const countEl = document.getElementById("count-el");

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function matchStudio(studio, q) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return [studio.name, studio.field, studio.city, (studio.tags || []).join(" ")].
    some(s => (s || "").toLowerCase().includes(lower));
}

function compare(a, b) {
  const va = (a[sortKey] ?? "").toString().toLowerCase();
  const vb = (b[sortKey] ?? "").toString().toLowerCase();
  if (va < vb) return -1 * sortDir;
  if (va > vb) return 1 * sortDir;
  return 0;
}

function getPreviewUrl(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;
}

function render() {
  filtered.sort(compare);
  countEl.textContent = `${filtered.length} items`;

  document.querySelectorAll(".idx-table th[data-sort]").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.sort === sortKey) th.classList.add(sortDir === 1 ? "sort-asc" : "sort-desc");
  });

  let html = "";
  filtered.forEach((studio, i) => {
    const linkLabel = studio.url === "#" ? "—" : "→";
    const linkCell = studio.url === "#"
      ? `<a href="#" onclick="event.preventDefault();event.stopPropagation();">${linkLabel}</a>`
      : `<a href="${escapeHtml(studio.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation();">${linkLabel}</a>`;
    const thumbs = (studio.previews || [])
      .map((seed) => `<img class="drawer-thumb" src="${getPreviewUrl(seed)}" alt="" loading="lazy">`)
      .join("");

    html += `
      <tr class="data-row" tabindex="0" data-index="${i}" data-href="${escapeHtml(studio.url)}" role="button">
        <td class="col-name">${escapeHtml(studio.name)}</td>
        <td class="col-field">${escapeHtml(studio.field)}</td>
        <td class="col-city">${escapeHtml(studio.city)}</td>
        <td class="col-link">${linkCell}</td>
      </tr>
      <tr class="drawer-row" data-index="${i}" aria-hidden="true">
        <td colspan="4" class="drawer-cell">
          <div class="drawer-wrapper">
            <div class="drawer-inner">
              <div class="drawer-content">
                <div class="drawer-thumbs">${thumbs}</div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  tableBody.innerHTML = html;
  bindRowEvents();
}

function getDrawerRow(dataRow) {
  const idx = dataRow.dataset.index;
  return tableBody.querySelector(`tr.drawer-row[data-index="${idx}"]`);
}

function openDrawer(dataRow) {
  const drawerRow = getDrawerRow(dataRow);
  if (!drawerRow) return;
  const wrapper = drawerRow.querySelector(".drawer-wrapper");
  if (wrapper) {
    wrapper.classList.add("is-open");
    drawerRow.setAttribute("aria-hidden", "false");
  }
}

function closeDrawer(dataRow) {
  const drawerRow = getDrawerRow(dataRow);
  if (!drawerRow) return;
  const wrapper = drawerRow.querySelector(".drawer-wrapper");
  if (wrapper) {
    wrapper.classList.remove("is-open");
    drawerRow.setAttribute("aria-hidden", "true");
  }
}

function closeAllDrawers() {
  tableBody.querySelectorAll(".drawer-wrapper.is-open").forEach((w) => {
    w.classList.remove("is-open");
    const row = w.closest("tr.drawer-row");
    if (row) row.setAttribute("aria-hidden", "true");
  });
}

function bindRowEvents() {
  tableBody.querySelectorAll("tr.data-row").forEach((row) => {
    row.addEventListener("mouseenter", () => openDrawer(row));
    row.addEventListener("mouseleave", () => closeDrawer(row));
    row.addEventListener("focus", () => openDrawer(row));
    row.addEventListener("blur", (e) => {
      const next = e.relatedTarget;
      const drawer = getDrawerRow(row);
      if (!next || (!row.contains(next) && (!drawer || !drawer.contains(next)))) closeDrawer(row);
    });
    row.addEventListener("click", (e) => {
      if (e.target.closest("a[href]") && e.target.closest("a[href]").getAttribute("href") !== "#") return;
      const href = row.dataset.href;
      if (href && href !== "#") window.open(href, "_blank", "noopener");
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const href = row.dataset.href;
        if (href && href !== "#") window.open(href, "_blank", "noopener");
      }
    });
  });
  tableBody.querySelectorAll("tr.drawer-row").forEach((drawerRow) => {
    drawerRow.addEventListener("mouseenter", () => {
      const dataRow = tableBody.querySelector(`tr.data-row[data-index="${drawerRow.dataset.index}"]`);
      if (dataRow) openDrawer(dataRow);
    });
    drawerRow.addEventListener("mouseleave", () => {
      const dataRow = tableBody.querySelector(`tr.data-row[data-index="${drawerRow.dataset.index}"]`);
      if (dataRow) closeDrawer(dataRow);
    });
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  filtered = studios.filter((s) => matchStudio(s, q));
  render();
});

document.querySelectorAll(".idx-table th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    if (th.dataset.sort === sortKey) sortDir *= -1;
    else { sortKey = th.dataset.sort; sortDir = 1; }
    render();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDrawers();
});

filtered = [...studios];
render();
