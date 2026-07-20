#!/usr/bin/env python3
import json, math, io, urllib.request
from PIL import Image, ImageDraw, ImageFont

TILE = 256
ZOOM = 18
UA = "yaizu-festival-route-map/1.0 (personal, non-commercial)"

with open("route_resolved.json", encoding="utf-8") as f:
    ROUTE = json.load(f)
with open("points_out.json", encoding="utf-8") as f:
    POINTS_OUT = json.load(f)
with open("points_ret.json", encoding="utf-8") as f:
    POINTS_RET = json.load(f)
with open("rest_areas.json", encoding="utf-8") as f:
    REST_AREAS = json.load(f)

FONT_DIR = "/System/Library/Fonts/Supplemental/"
FONT_BOLD = ImageFont.truetype(FONT_DIR + "Arial Bold.ttf", 39)
FONT_LABEL = ImageFont.truetype("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", 39)

# Manual (dx, dy) pixel nudges applied after automatic placement, for labels
# the auto collision-avoidance placed somewhere technically-clear but visually
# awkward. Keyed by stop label text; keep small enough to avoid reintroducing
# an overlap the algorithm already avoided.
LABEL_NUDGE = {
    "アトレ焼津": (0, 150),
    "昭和通り": (-220, 70),
    "焼津市役所": (240, -68),
    "南御旅所": (50, -10),
    "しずおか焼津信金": (25, -55),
    "塩川新聞舗": (-190, -65),
    "神武通り": (-135, -15),
    "三区会所": (204, 86),
    "焼津御旅所": (60, 15),
    "焼津警察署中央交番": (-40, 167),
    "八雲通り": (0, 25),
}

# Rest-area star markers to suppress on a specific leg's map even though the
# area's name matches a named point shown there (e.g. shared stops like
# 北御旅所 appear on both legs, but the rest-area marker is only wanted on one).
REST_AREA_SKIP_ON_LEG = {
    ("駐車場（北御旅所）", "帰路"),
}

# Manual line-break override for label display text, keyed by stop label
# text. Only affects rendering (draw.multiline_text); the underlying name
# used for matching LABEL_NUDGE / "〜通り" heading-bias stays the original
# unbroken label.
LABEL_BREAK = {
    "焼津警察署中央交番": "焼津警察署\n中央交番",
    "しずおか焼津信金": "しずおか\n焼津信金",
}

# Manual (dx, dy) pixel nudges applied to a marker's own drawn position (not
# its label), for stops whose true coordinate sits so close to another named
# stop that the markers would visually overlap or crowd each other even
# though they are legitimately distinct points. Keyed by stop label text.
MARKER_NUDGE = {
    "浜通り": (0, -55),
}

def lonlat_to_world_px(lat, lng, zoom):
    n = 2 ** zoom
    x = (lng + 180.0) / 360.0 * n * TILE
    lat_rad = math.radians(lat)
    y = (1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n * TILE
    return x, y

def fetch_tile(z, x, y):
    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGB")

def build_basemap(px0, py0, px1, py1, zoom):
    tx0, ty0 = int(px0 // TILE), int(py0 // TILE)
    tx1, ty1 = int(px1 // TILE), int(py1 // TILE)
    w = (tx1 - tx0 + 1) * TILE
    h = (ty1 - ty0 + 1) * TILE
    canvas = Image.new("RGB", (w, h), "white")
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            try:
                tile = fetch_tile(zoom, tx, ty)
            except Exception as e:
                print("tile fail", tx, ty, e)
                tile = Image.new("RGB", (TILE, TILE), "#eeeeee")
            canvas.paste(tile, ((tx - tx0) * TILE, (ty - ty0) * TILE))
    ox = tx0 * TILE
    oy = ty0 * TILE
    crop = canvas.crop((int(px0 - ox), int(py0 - oy), int(px1 - ox), int(py1 - oy)))
    return crop

def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])

def build_display_path(pts, sep=11, close_thresh=17, angle_thresh_deg=25):
    """Detect near-parallel, near-overlapping non-adjacent segments and bulge
    their midpoints apart perpendicular to segment direction, without moving
    true endpoints."""
    segs = [(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
    n = len(segs)
    bulges = [0.0] * n  # signed perpendicular offset per segment
    cos_thresh = math.cos(math.radians(angle_thresh_deg))

    def seg_dir(s):
        (x0, y0), (x1, y1) = s
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy)
        if L == 0:
            return 0.0, 0.0, 0.0
        return dx / L, dy / L, L

    def seg_mid(s):
        (x0, y0), (x1, y1) = s
        return ((x0 + x1) / 2, (y0 + y1) / 2)

    for i in range(n):
        for j in range(i + 1, n):
            if j <= i + 1:
                continue
            dx0, dy0, L0 = seg_dir(segs[i])
            dx1, dy1, L1 = seg_dir(segs[j])
            if L0 == 0 or L1 == 0:
                continue
            dot = dx0 * dx1 + dy0 * dy1
            if abs(dot) < cos_thresh:
                continue
            mi, mj = seg_mid(segs[i]), seg_mid(segs[j])
            d = dist(mi, mj)
            if d >= close_thresh:
                continue
            nx, ny = -dy0, dx0
            side = 1.0 if ((mj[0] - mi[0]) * nx + (mj[1] - mi[1]) * ny) >= 0 else -1.0
            bulges[i] += -side * sep / 2
            bulges[j] += side * sep / 2

    new_pts = [pts[0]]
    for i, (p0, p1) in enumerate(segs):
        if bulges[i]:
            dx, dy, L = seg_dir((p0, p1))
            nx, ny = -dy, dx
            off = bulges[i]
            # shift the middle 60% of the segment sideways as a unit (two
            # transition joints + a clean parallel run) instead of bulging a
            # single midpoint (which reads as a sharp kink/spike)
            t0, t1 = 0.2, 0.8
            q0 = (p0[0] + dx * L * t0 + nx * off, p0[1] + dy * L * t0 + ny * off)
            q1 = (p0[0] + dx * L * t1 + nx * off, p0[1] + dy * L * t1 + ny * off)
            new_pts.append(q0)
            new_pts.append(q1)
        new_pts.append(p1)
    return new_pts

def draw_arrow(draw, p0, p1, color, avoid=None):
    L = dist(p0, p1)
    if L < 36:
        return
    dx, dy = (p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L
    size = 20
    # try the midpoint first, then slide along the segment (both directions)
    # to dodge any marker circle the midpoint would land under
    candidates_t = [0.5, 0.35, 0.65, 0.2, 0.8]
    chosen = None
    for t in candidates_t:
        cx, cy = p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t
        if avoid and any(dist((cx, cy), (mx, my)) < mr for mx, my, mr in avoid):
            continue
        chosen = (cx, cy)
        break
    if chosen is None:
        return
    mx, my = chosen
    left = (mx - dx * size - dy * size * 0.6, my - dy * size + dx * size * 0.6)
    right = (mx - dx * size + dy * size * 0.6, my - dy * size - dx * size * 0.6)
    tip = (mx + dx * size * 0.4, my + dy * size * 0.4)
    draw.polygon([tip, left, right], fill=color)

def draw_star(draw, cx, cy, r_outer, fill, outline, outline_width=2):
    """5-point star, point-up, outer radius r_outer, inner radius ~0.4x."""
    r_inner = r_outer * 0.4
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        r = r_outer if i % 2 == 0 else r_inner
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    draw.polygon(pts, fill=fill, outline=outline, width=outline_width)

def text_bbox(draw, xy, text, font):
    l, t, r, b = draw.textbbox(xy, text, font=font)
    return l, t, r, b

def rects_overlap(a, b, pad=3):
    return not (a[2] + pad < b[0] or b[2] + pad < a[0] or a[3] + pad < b[1] or b[3] + pad < a[1])

def multiline_size(draw, text, font, line_spacing=6):
    lines = text.split("\n")
    tw = max(draw.textlength(line, font=font) for line in lines)
    line_h = font.size + line_spacing
    th = line_h * len(lines) - line_spacing
    return tw, th

def place_label(draw, cx, cy, text, font, W, H, occupied, line_pts, preferred_angle=None):
    tw, th = multiline_size(draw, text, font)
    th = max(th, 46)
    pad = 10
    box_w, box_h = tw + pad * 2, th + pad * 2
    candidates = []
    # angle offsets tried in preference order: straight ahead first, widening
    # outward, so a preferred direction (route heading) wins unless blocked
    ang_offsets_deg = [0, -20, 20, -40, 40, -65, 65, -90, 90, -125, 125, -155, 155, 180]
    for radius in (30, 40, 52, 66, 82, 100):
        for off_deg in ang_offsets_deg:
            base_ang = preferred_angle if preferred_angle is not None else 0.0
            ang = base_ang + math.radians(off_deg)
            lx = cx + radius * math.cos(ang) - box_w / 2
            ly = cy + radius * math.sin(ang) - box_h / 2
            candidates.append((lx, ly))
    if preferred_angle is None:
        # no directional preference: fall back to plain all-around search
        candidates = []
        for radius in (26, 34, 44, 56, 70, 86):
            for ang_deg in range(0, 360, 30):
                ang = math.radians(ang_deg)
                lx = cx + radius * math.cos(ang) - box_w / 2
                ly = cy + radius * math.sin(ang) - box_h / 2
                candidates.append((lx, ly))
    best = None
    best_score = -1
    for rank, (lx, ly) in enumerate(candidates):
        rect = (lx, ly, lx + box_w, ly + box_h)
        if rect[0] < 2 or rect[1] < 2 or rect[2] > W - 2 or rect[3] > H - 2:
            continue
        if any(rects_overlap(rect, o) for o in occupied):
            continue
        min_line_d = min(
            (point_seg_dist((rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2, line_pts[k], line_pts[k + 1])
             for k in range(len(line_pts) - 1)),
            default=999,
        )
        if min_line_d < 12:
            continue
        if preferred_angle is not None:
            # first workable candidate wins (list is already preference-ordered);
            # don't let a farther/clearer spot outrank the one closest to the
            # route heading
            best = rect
            break
        score = min_line_d
        if score > best_score:
            best_score = score
            best = rect
    if best is None:
        # fallback: allow line proximity, just avoid label overlap
        for lx, ly in candidates:
            rect = (lx, ly, lx + box_w, ly + box_h)
            if rect[0] < 2 or rect[1] < 2 or rect[2] > W - 2 or rect[3] > H - 2:
                continue
            if any(rects_overlap(rect, o) for o in occupied):
                continue
            best = rect
            break
    if best is None:
        best = (cx + 16, cy - th / 2 - pad, cx + 16 + box_w, cy + th / 2 + pad)
    return best

def point_seg_dist(px, py, p0, p1):
    x0, y0 = p0
    x1, y1 = p1
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy
    if L2 == 0:
        return dist((px, py), p0)
    t = max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / L2))
    projx, projy = x0 + t * dx, y0 + t * dy
    return dist((px, py), (projx, projy))

def render_leg(route_pts, named_pts, out_path, line_color, leg_name, pad_px=90, marker_r=32):
    world = [lonlat_to_world_px(p["lat"], p["lng"], ZOOM) for p in route_pts]
    xs = [w[0] for w in world]
    ys = [w[1] for w in world]
    px0, py0 = min(xs) - pad_px, min(ys) - pad_px
    px1, py1 = max(xs) + pad_px, max(ys) + pad_px

    print("fetching basemap for", out_path, "size", px1 - px0, py1 - py0)
    base = build_basemap(px0, py0, px1, py1, ZOOM)
    W, H = base.size
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)

    def to_px(lat, lng):
        wx, wy = lonlat_to_world_px(lat, lng, ZOOM)
        return (wx - px0, wy - py0)

    line_pts_orig = [to_px(p["lat"], p["lng"]) for p in route_pts]
    line_pts = build_display_path(line_pts_orig, sep=22, close_thresh=34, angle_thresh_deg=25)

    # marker positions (named points, in order) using ORIGINAL (non-bulged) coords
    marker_true = [to_px(p["lat"], p["lng"]) for p in named_pts]

    # auto-detect near-duplicate marker coordinates and nudge apart (no
    # true-position leader line back to the shared point — when two named
    # stops legitimately share one location, that connector just reads as a
    # stray unexplained line rather than useful information).
    # Detection threshold is a fixed pixel distance (tuned for ZOOM=18), not
    # scaled by marker_r: true duplicates share the exact same source
    # coordinate (dist ~0, from two labels reusing one maps.app.goo.gl link),
    # while genuinely distinct-but-nearby stops (e.g. two points ~8m apart on
    # the same street) must never be nudged just because markers got bigger.
    def route_index_of(lat, lng):
        for idx, p in enumerate(route_pts):
            if abs(p["lat"] - lat) < 1e-9 and abs(p["lng"] - lng) < 1e-9:
                return idx
        return None

    def route_heading_at(idx):
        """Direction the route leaves point idx, skipping any zero-length
        (duplicate) segments, so the vector is never (0, 0)."""
        if idx is None:
            return None
        j = idx + 1
        while j < len(line_pts_orig):
            dx = line_pts_orig[j][0] - line_pts_orig[idx][0]
            dy = line_pts_orig[j][1] - line_pts_orig[idx][1]
            if dx or dy:
                L = math.hypot(dx, dy)
                return dx / L, dy / L
            j += 1
        return None

    DUPLICATE_PX = 10
    marker_draw = list(marker_true)
    is_duplicate_nudged = [False] * len(marker_true)
    placed = []
    for i, (x, y) in enumerate(marker_true):
        conflict = None
        for j in placed:
            if dist((x, y), marker_draw[j]) < DUPLICATE_PX:
                conflict = j
                break
        if conflict is not None:
            # just enough separation for the two circles not to touch
            # (2*marker_r + small gap) — kept tight so the nudged marker
            # doesn't drift far from its true (shared) coordinate.
            # Nudge along the route's own outgoing heading at this point so
            # the second marker still reads as sitting on the path, instead
            # of floating off to an arbitrary fixed-angle side.
            sep = marker_r * 2 + 16
            heading = route_heading_at(route_index_of(named_pts[i]["lat"], named_pts[i]["lng"]))
            if heading is None:
                ang = math.radians(35)
                heading = (math.cos(ang), -math.sin(ang))
            nx = marker_draw[conflict][0] + heading[0] * sep
            ny = marker_draw[conflict][1] + heading[1] * sep
            marker_draw[i] = (nx, ny)
            is_duplicate_nudged[i] = True
        placed.append(i)

    for i, p in enumerate(named_pts):
        if p["label"] in MARKER_NUDGE:
            ndx, ndy = MARKER_NUDGE[p["label"]]
            marker_draw[i] = (marker_draw[i][0] + ndx, marker_draw[i][1] + ndy)

    # pass 1: route line + arrows (markers already positioned so arrows can
    # dodge them instead of being drawn underneath and hidden)
    draw.line(line_pts, fill=line_color, width=5, joint="curve")
    marker_circles = [(mx, my, marker_r + 6) for mx, my in marker_draw]

    def seg_angle(p0, p1):
        return math.atan2(p1[1] - p0[1], p1[0] - p0[0])

    def angle_diff(a, b):
        d = abs(a - b) % (2 * math.pi)
        return min(d, 2 * math.pi - d)

    for i in range(len(line_pts) - 1):
        p0, p1 = line_pts[i], line_pts[i + 1]
        # skip the arrow on a short "jog" segment whose direction diverges
        # sharply from the previous segment's — its own arrow reads as
        # pointing off in the wrong direction, and the longer surrounding
        # segments already carry the direction cue
        seg_len = dist(p0, p1)
        if seg_len < 100 and i > 0:
            prev_ang = seg_angle(line_pts[i - 1], p0)
            this_ang = seg_angle(p0, p1)
            if angle_diff(prev_ang, this_ang) > math.radians(50):
                continue
        draw_arrow(draw, p0, p1, line_color, avoid=marker_circles)

    # thin connector back to the true coordinate for markers that got pushed
    # apart from an exact-duplicate point, so the offset doesn't read as an
    # unexplained/wrong position — drawn under the markers themselves
    for i, dup in enumerate(is_duplicate_nudged):
        if dup:
            draw.line([marker_true[i], marker_draw[i]], fill=(150, 30, 30), width=2)
            draw.ellipse(
                [marker_true[i][0] - 4, marker_true[i][1] - 4, marker_true[i][0] + 4, marker_true[i][1] + 4],
                fill=(150, 30, 30),
            )

    def find_route_index(lat, lng):
        for idx, p in enumerate(route_pts):
            if abs(p["lat"] - lat) < 1e-9 and abs(p["lng"] - lng) < 1e-9:
                return idx
        return None

    # pass 3: labels (number + name), collision-avoided
    # "〜通り" labels name the street travelled just after this point, so bias
    # their placement toward the route's heading leaving this point.
    # Seed `occupied` with every marker's footprint (not just other labels)
    # so a label can never be placed on top of an unrelated numbered marker.
    marker_pad = 4
    occupied = [
        (mx - marker_r - marker_pad, my - marker_r - marker_pad, mx + marker_r + marker_pad, my + marker_r + marker_pad)
        for mx, my in marker_draw
    ]
    label_boxes = []
    for i, (mx, my) in enumerate(marker_draw):
        name = named_pts[i]["label"]
        text = LABEL_BREAK.get(name, name)
        preferred_angle = None
        if name.endswith("通り"):
            idx = find_route_index(named_pts[i]["lat"], named_pts[i]["lng"])
            if idx is not None and idx + 1 < len(line_pts_orig):
                p0, p1 = line_pts_orig[idx], line_pts_orig[idx + 1]
                dx, dy = p1[0] - p0[0], p1[1] - p0[1]
                if dx or dy:
                    preferred_angle = math.atan2(dy, dx)
        rect = place_label(draw, mx, my, text, FONT_LABEL, W, H, occupied, line_pts, preferred_angle=preferred_angle)
        if name in LABEL_NUDGE:
            ndx, ndy = LABEL_NUDGE[name]
            rect = (rect[0] + ndx, rect[1] + ndy, rect[2] + ndx, rect[3] + ndy)
        occupied.append(rect)
        label_boxes.append((rect, text, (mx, my)))

    # leader lines from each marker to its own label, so the pairing is
    # explicit even when the label sits some distance away
    for rect, text, (mx, my) in label_boxes:
        rcx, rcy = (rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2
        draw.line([(mx, my), (rcx, rcy)], fill=(90, 90, 90), width=2)

    for rect, text, _ in label_boxes:
        draw.rectangle(rect, fill=(255, 255, 255, 235), outline=(90, 90, 90), width=1)
        draw.multiline_text((rect[0] + 6, rect[1] + 4), text, font=FONT_LABEL, fill=(20, 20, 20), spacing=6)

    # pass 4: markers on top
    for i, (mx, my) in enumerate(marker_draw):
        draw.ellipse(
            [mx - marker_r, my - marker_r, mx + marker_r, my + marker_r],
            fill=(200, 30, 30),
            outline=(255, 255, 255),
            width=2,
        )
        num = str(i + 1)
        bbox = draw.textbbox((0, 0), num, font=FONT_BOLD)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((mx - tw / 2 - bbox[0], my - th / 2 - bbox[1]), num, font=FONT_BOLD, fill=(255, 255, 255))

    # pass 5: rest-area (休憩所) star markers — only for areas whose name
    # matches a named point actually shown (with its own callout) on this
    # leg's map; areas with no corresponding labeled stop (e.g. 集合場所,
    # which isn't a route waypoint) are skipped rather than shown floating
    # with no map context
    leg_point_labels = {p["label"] for p in named_pts}
    for area in REST_AREAS:
        if area["area"] not in leg_point_labels:
            continue
        if (area["label"], leg_name) in REST_AREA_SKIP_ON_LEG:
            continue
        sx, sy = to_px(area["lat"], area["lng"])
        if 0 <= sx <= W and 0 <= sy <= H:
            draw_star(draw, sx, sy, 20, fill=(255, 105, 180), outline=(150, 30, 90))

    img.save(out_path, quality=92)
    print("saved", out_path, img.size)

if __name__ == "__main__":
    render_leg(ROUTE["往路"], POINTS_OUT, "mikoshi-route-outbound.jpg", (30, 80, 220), "往路", pad_px=90)
    render_leg(ROUTE["帰路"], POINTS_RET, "mikoshi-route-return.jpg", (30, 140, 60), "帰路", pad_px=90)
