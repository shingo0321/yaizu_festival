function renderHero() {
  document.getElementById("hero-title").textContent = FESTIVAL_DATA.title;
  document.getElementById("hero-subtitle").textContent = FESTIVAL_DATA.subtitle;
  document.getElementById("hero-date").textContent = FESTIVAL_DATA.dateRange;
}

function formatTitle(title) {
  return title
    .split("\n")
    .map((line) => (line.startsWith("※") ? `<span class="note">${line}</span>` : line))
    .join("\n");
}

function renderSchedule() {
  const container = document.getElementById("schedule-panel");
  container.innerHTML = `
    <a class="pdf-link" href="schedule.pdf" target="_blank" rel="noopener">印刷用PDFを開く</a>
  ` + FESTIVAL_DATA.schedule
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
                    <div class="title">${formatTitle(item.title)}</div>
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
  const routeDiagram = data.routeDiagram;
  const routeImg = data.officialRouteImage;

  container.innerHTML = `
    <div class="venue-card">
      <h2>${data.title}</h2>
      ${
        routeDiagram
          ? `
        <div class="route-image">
          <img class="zoomable" src="${routeDiagram.src}" alt="${routeDiagram.alt}" loading="lazy" />
          <p class="route-image-caption">${routeDiagram.caption}</p>
        </div>
      `
          : ""
      }
      ${
        routeImg
          ? `
        <div class="route-image">
          <img class="zoomable" src="${routeImg.src}" alt="${routeImg.alt}" loading="lazy" />
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

function renderRoles() {
  const container = document.getElementById("roles-panel");
  container.innerHTML = `
    <div class="venue-card">
      <h2>役割</h2>
      <ul class="roles-list">
        ${FESTIVAL_DATA.roles
          .map(
            (r) => `
              <li>
                <div class="role-name">${r.role}</div>
                <div class="role-people">${r.people}</div>
              </li>
            `
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

function setupSwipe() {
  const buttons = document.querySelectorAll("nav.tabs button");
  let startX = 0;
  let startY = 0;

  document.addEventListener(
    "touchstart",
    (e) => {
      startX = e.changedTouches[0].screenX;
      startY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      const deltaX = e.changedTouches[0].screenX - startX;
      const deltaY = e.changedTouches[0].screenY - startY;

      if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

      const currentIndex = [...buttons].findIndex((b) => b.classList.contains("active"));
      const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex >= 0 && nextIndex < buttons.length) {
        buttons[nextIndex].click();
      }
    },
    { passive: true }
  );
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const viewport = document.getElementById("lightbox-viewport");
  const img = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  const zoomInBtn = document.getElementById("lightbox-zoom-in");
  const zoomOutBtn = document.getElementById("lightbox-zoom-out");

  const ZOOM_LEVELS = [1, 2, 3, 4];
  let zoomIndex = 0;

  function applyZoom() {
    const zoom = ZOOM_LEVELS[zoomIndex];
    if (zoom === 1) {
      img.style.width = "";
      img.style.height = "";
      img.style.maxWidth = "";
      img.style.maxHeight = "";
    } else {
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
      img.style.width = zoom * 100 + "%";
      img.style.height = "auto";
    }
    zoomOutBtn.disabled = zoomIndex === 0;
    zoomInBtn.disabled = zoomIndex === ZOOM_LEVELS.length - 1;
  }

  function open(src, alt) {
    img.src = src;
    img.alt = alt || "";
    zoomIndex = 0;
    applyZoom();
    viewport.scrollTo(0, 0);
    lightbox.hidden = false;
  }

  function close() {
    lightbox.hidden = true;
    img.src = "";
  }

  function zoomIn() {
    zoomIndex = Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1);
    applyZoom();
  }

  function zoomOut() {
    zoomIndex = Math.max(zoomIndex - 1, 0);
    applyZoom();
  }

  document.querySelectorAll(".zoomable").forEach((el) => {
    el.addEventListener("click", () => open(el.src, el.alt));
  });

  img.addEventListener("click", zoomIn);
  zoomInBtn.addEventListener("click", zoomIn);
  zoomOutBtn.addEventListener("click", zoomOut);
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === viewport) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.hidden && e.key === "Escape") close();
  });
}

renderHero();
renderSchedule();
renderMapPins();
renderRoles();
setupTabs();
setupSwipe();
setupLightbox();
