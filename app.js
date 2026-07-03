function renderHero() {
  document.getElementById("hero-title").textContent = FESTIVAL_DATA.title;
  document.getElementById("hero-subtitle").textContent = FESTIVAL_DATA.subtitle;
  document.getElementById("hero-date").textContent = FESTIVAL_DATA.dateRange;
}

function renderSchedule() {
  const container = document.getElementById("schedule-panel");
  container.innerHTML = FESTIVAL_DATA.schedule
    .map(
      (day) => `
        <div class="day-block">
          <h2>${day.day}</h2>
          <div class="date">${day.date}</div>
          ${day.items
            .map(
              (item) => `
                <div class="timetable-item">
                  <div class="time">${item.time}</div>
                  <div>
                    <div class="title">${item.title}</div>
                    <div class="place">${item.place}</div>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `
    )
    .join("");
}

function renderMapPins() {
  const container = document.getElementById("map-panel");
  const data = FESTIVAL_DATA.mapPins;
  const routeImg = data.officialRouteImage;
  const routeLines = data.mikoshiRouteLines;

  container.innerHTML = `
    <div class="venue-card">
      <h2>${data.title}</h2>
      <div id="leaflet-map" class="map-embed"></div>
      ${
        routeLines
          ? `
        <div class="map-legend">
          <span><span class="legend-swatch outbound"></span>往路（神社→南→北→魚市場御旅所）</span>
          <span><span class="legend-swatch return"></span>帰路（魚市場御旅所→神社）</span>
        </div>
      `
          : ""
      }
      <ul class="access-list">
        ${data.points.map((p) => `<li>${p.label}</li>`).join("")}
      </ul>
      ${
        routeImg
          ? `
        <div class="route-image">
          <a href="${routeImg.sourceUrl}" target="_blank" rel="noopener noreferrer">
            <img src="${routeImg.src}" alt="${routeImg.alt}" loading="lazy" />
          </a>
          <p class="route-image-caption">
            <a href="${routeImg.sourceUrl}" target="_blank" rel="noopener noreferrer">${routeImg.caption}</a>
          </p>
        </div>
      `
          : ""
      }
    </div>
  `;

  const map = L.map("leaflet-map");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(map);

  const markers = data.points.map((p) => L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.label));

  if (routeLines) {
    const toLatLngs = (pts) => pts.map((p) => [p.lat, p.lng]);

    // 濃い黒＝往路
    L.polyline(toLatLngs(routeLines.outbound), { color: "#1a1a1a", weight: 4 }).addTo(map);
    // 薄い黒（グレー）＝帰路
    L.polyline(toLatLngs(routeLines.return), { color: "#999999", weight: 4, dashArray: "8,8" }).addTo(map);

    [...routeLines.outbound, ...routeLines.return].forEach((p) => {
      markers.push(L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.label));
    });
  }

  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.3));

  return map;
}

function setupTabs(onShow) {
  const buttons = document.querySelectorAll("nav.tabs button");
  const panels = document.querySelectorAll("section.panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
      if (onShow) onShow(btn.dataset.target);
    });
  });
}

async function setupLiffShare() {
  const LIFF_ID = "2010598438-IL4pnvpt";
  const shareBtn = document.getElementById("share-btn");

  try {
    await liff.init({ liffId: LIFF_ID });
    if (liff.isInClient() && liff.isApiAvailable("shareTargetPicker")) {
      shareBtn.style.display = "block";
      shareBtn.addEventListener("click", async () => {
        try {
          await liff.shareTargetPicker([
            {
              type: "text",
              text: `${FESTIVAL_DATA.title} ${FESTIVAL_DATA.dateRange}\n${location.href}`
            }
          ]);
        } catch (err) {
          console.error(err);
        }
      });
    }
  } catch (err) {
    // LINE外のブラウザではLIFF初期化に失敗することがあるが、
    // ポータルサイト自体は通常ページとして表示できるため無視する。
    console.log("LIFF init skipped:", err.message);
  }
}

renderHero();
renderSchedule();
const mapPinsInstance = renderMapPins();
setupTabs((targetId) => {
  if (targetId === "map-panel") {
    // 非表示タブの中で初期化されるため、表示された直後にサイズを再計算する
    setTimeout(() => mapPinsInstance.invalidateSize(), 0);
  }
});
setupLiffShare();
