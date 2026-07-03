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

function renderVenue() {
  const container = document.getElementById("venue-panel");
  const venue = FESTIVAL_DATA.venue;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(venue.address)}&output=embed`;

  container.innerHTML = `
    <div class="venue-card">
      <h2>${venue.name}</h2>
      <iframe class="map-embed" src="${mapSrc}" loading="lazy" allowfullscreen></iframe>
      <ul class="access-list">
        ${venue.access.map((line) => `<li>${line}</li>`).join("")}
      </ul>
    </div>
  `;
}

function setupTabs() {
  const buttons = document.querySelectorAll("nav.tabs button");
  const panels = document.querySelectorAll("section.panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
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
renderVenue();
setupTabs();
setupLiffShare();
