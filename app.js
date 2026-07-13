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
      ${
        routeDiagram
          ? `
        <div class="route-image">
          <img class="zoomable route-diagram-img" src="${routeDiagram.src}" alt="${routeDiagram.alt}" loading="lazy" />
          <p class="route-image-caption">${routeDiagram.caption}</p>
          ${
            routeDiagram.pdf
              ? `<a class="pdf-link" href="${routeDiagram.pdf}" target="_blank" rel="noopener">簡略図のPDFを開く</a>`
              : ""
          }
        </div>
      `
          : ""
      }
      <h3>往路</h3>
      <ol class="access-list">
        ${data.points
          .map((p) =>
            p.mapUrl
              ? `<li>${p.label}（<a href="${p.mapUrl}" target="_blank" rel="noopener noreferrer">Googleマップで見る</a>）</li>`
              : `<li>${p.label}</li>`
          )
          .join("")}
      </ol>
      <h3>帰路</h3>
      <ol class="access-list">
        ${data.pointsReturn
          .map((p) =>
            p.mapUrl
              ? `<li>${p.label}（<a href="${p.mapUrl}" target="_blank" rel="noopener noreferrer">Googleマップで見る</a>）</li>`
              : `<li>${p.label}</li>`
          )
          .join("")}
      </ol>
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

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 6;
  const STEP_FACTOR = 1.5;

  let zoom = 1;
  let baseWidth = 0; // image width at zoom===1 (fitted via max-width/max-height), measured lazily

  function measureBaseWidth() {
    img.style.maxWidth = "";
    img.style.maxHeight = "";
    img.style.width = "";
    img.style.height = "";
    baseWidth = img.getBoundingClientRect().width;
  }

  // Zooms so the content under (anchorX, anchorY) in viewport coordinates
  // stays under that same point after the resize, like a mouse/pinch zoom.
  function setZoom(nextZoom, anchorX, anchorY) {
    nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    if (nextZoom === zoom) return;
    if (!baseWidth) measureBaseWidth();

    const vpRect = viewport.getBoundingClientRect();
    const contentX = anchorX - vpRect.left + viewport.scrollLeft;
    const contentY = anchorY - vpRect.top + viewport.scrollTop;
    const ratio = nextZoom / zoom;

    zoom = nextZoom;
    if (zoom === 1) {
      img.style.width = "";
      img.style.height = "";
      img.style.maxWidth = "";
      img.style.maxHeight = "";
    } else {
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
      img.style.width = baseWidth * zoom + "px";
      img.style.height = "auto";
    }

    viewport.scrollLeft = contentX * ratio - (anchorX - vpRect.left);
    viewport.scrollTop = contentY * ratio - (anchorY - vpRect.top);

    zoomOutBtn.disabled = zoom <= MIN_ZOOM;
    zoomInBtn.disabled = zoom >= MAX_ZOOM;
  }

  function viewportCenter() {
    const r = viewport.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // Where the user last touched/clicked/pinched inside the viewport, so the
  // +/- buttons zoom around whatever the user was just looking at instead of
  // always the screen center. Falls back to the viewport center before any
  // interaction has happened yet.
  let lastPointer = null;

  function zoomAnchor() {
    return lastPointer || viewportCenter();
  }

  function open(src, alt) {
    img.src = src;
    img.alt = alt || "";
    zoom = 1;
    baseWidth = 0;
    lastPointer = null;
    img.style.width = "";
    img.style.height = "";
    img.style.maxWidth = "";
    img.style.maxHeight = "";
    zoomOutBtn.disabled = true;
    zoomInBtn.disabled = false;
    viewport.scrollTo(0, 0);
    lightbox.hidden = false;
  }

  function close() {
    lightbox.hidden = true;
    img.src = "";
  }

  document.querySelectorAll(".zoomable").forEach((el) => {
    el.addEventListener("click", () => open(el.src, el.alt));
  });

  img.addEventListener("click", (e) => {
    if (dragged) return; // don't zoom on the click that ends a drag
    lastPointer = { x: e.clientX, y: e.clientY };
    setZoom(zoom * STEP_FACTOR, e.clientX, e.clientY);
  });
  zoomInBtn.addEventListener("click", () => {
    const p = zoomAnchor();
    setZoom(zoom * STEP_FACTOR, p.x, p.y);
  });
  zoomOutBtn.addEventListener("click", () => {
    const p = zoomAnchor();
    setZoom(zoom / STEP_FACTOR, p.x, p.y);
  });
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === viewport) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.hidden && e.key === "Escape") close();
  });

  // Mouse wheel: zoom toward the cursor position.
  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      lastPointer = { x: e.clientX, y: e.clientY };
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setZoom(zoom * factor, e.clientX, e.clientY);
    },
    { passive: false }
  );

  // One finger/mouse button: drag to pan. Two fingers: pinch to zoom toward
  // the midpoint. touch-action:none on the viewport hands both gestures
  // entirely to this pointer-event handling (no native scroll/pinch).
  const pointers = new Map();
  let pinchStartDist = 0;
  let pinchStartZoom = 1;
  let dragStart = null; // { x, y, scrollLeft, scrollTop }
  let dragged = false;
  const DRAG_THRESHOLD = 6; // px of movement before a tap counts as a drag

  viewport.addEventListener("pointerdown", (e) => {
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastPointer = { x: e.clientX, y: e.clientY };
    if (pointers.size === 1) {
      dragStart = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
      };
      dragged = false;
    } else if (pointers.size === 2) {
      dragStart = null;
      const [a, b] = [...pointers.values()];
      pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStartZoom = zoom;
    }
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2 && pinchStartDist > 0) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      lastPointer = { x: midX, y: midY };
      setZoom(pinchStartZoom * (dist / pinchStartDist), midX, midY);
    } else if (pointers.size === 1 && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      if (!dragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        dragged = true;
        viewport.classList.add("dragging");
      }
      if (dragged) {
        viewport.scrollLeft = dragStart.scrollLeft - dx;
        viewport.scrollTop = dragStart.scrollTop - dy;
      }
      lastPointer = { x: e.clientX, y: e.clientY };
    } else {
      lastPointer = { x: e.clientX, y: e.clientY };
    }
  });

  function releasePointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStartDist = 0;
    if (pointers.size === 0) {
      dragStart = null;
      viewport.classList.remove("dragging");
      // Deferred so the click event that follows this pointerup (which the
      // img's click handler checks `dragged` against) still sees it as true.
      setTimeout(() => {
        dragged = false;
      }, 0);
    }
  }
  viewport.addEventListener("pointerup", releasePointer);
  viewport.addEventListener("pointercancel", releasePointer);
  viewport.addEventListener("pointerleave", releasePointer);
}

renderHero();
renderSchedule();
renderMapPins();
renderRoles();
setupTabs();
setupSwipe();
setupLightbox();
