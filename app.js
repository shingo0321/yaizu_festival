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
          <h2>${day.date}</h2>
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

  container.innerHTML = `
    <div class="venue-card">
      <h2>${data.title}</h2>
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
      <ul class="access-list">
        ${data.points
          .map((p) =>
            p.mapUrl
              ? `<li>${p.label}（<a href="${p.mapUrl}" target="_blank" rel="noopener noreferrer">Googleマップで見る</a>）</li>`
              : `<li>${p.label}</li>`
          )
          .join("")}
      </ul>
    </div>
  `;
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
renderMapPins();
setupTabs();
setupLiffShare();
