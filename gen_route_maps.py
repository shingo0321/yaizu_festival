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

FONT_DIR = "/System/Library/Fonts/Supplemental/"
FONT_BOLD = ImageFont.truetype(FONT_DIR + "Arial Bold.ttf", 19)
FONT_LABEL = ImageFont.truetype("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", 20)

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

def draw_arrow(draw, p0, p1, color):
    L = dist(p0, p1)
    if L < 36:
        return
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
    dx, dy = (p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L
    size = 9
    left = (mx - dx * size - dy * size * 0.6, my - dy * size + dx * size * 0.6)
    right = (mx - dx * size + dy * size * 0.6, my - dy * size - dx * size * 0.6)
    tip = (mx + dx * size * 0.4, my + dy * size * 0.4)
    draw.polygon([tip, left, right], fill=color)

def text_bbox(draw, xy, text, font):
    l, t, r, b = draw.textbbox(xy, text, font=font)
    return l, t, r, b

def rects_overlap(a, b, pad=3):
    return not (a[2] + pad < b[0] or b[2] + pad < a[0] or a[3] + pad < b[1] or b[3] + pad < a[1])

def place_label(draw, cx, cy, text, font, W, H, occupied, line_pts, preferred_angle=None):
    tw = draw.textlength(text, font=font)
    th = 24
    pad = 6
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

def render_leg(route_pts, named_pts, out_path, line_color, pad_px=90, marker_r=15):
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

    # pass 1: route line + arrows
    draw.line(line_pts, fill=line_color, width=5, joint="curve")
    for i in range(len(line_pts) - 1):
        draw_arrow(draw, line_pts[i], line_pts[i + 1], line_color)

    # marker positions (named points, in order) using ORIGINAL (non-bulged) coords
    marker_true = [to_px(p["lat"], p["lng"]) for p in named_pts]

    # auto-detect near-duplicate marker coordinates and nudge apart (no
    # true-position leader line back to the shared point — when two named
    # stops legitimately share one location, that connector just reads as a
    # stray unexplained line rather than useful information)
    marker_draw = list(marker_true)
    placed = []
    for i, (x, y) in enumerate(marker_true):
        conflict = None
        for j in placed:
            if dist((x, y), marker_draw[j]) < marker_r * 1.6:
                conflict = j
                break
        if conflict is not None:
            ang = math.radians(35)
            nx = marker_draw[conflict][0] + math.cos(ang) * marker_r * 2.6
            ny = marker_draw[conflict][1] - math.sin(ang) * marker_r * 2.6
            marker_draw[i] = (nx, ny)
        placed.append(i)

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
        text = name
        preferred_angle = None
        if name.endswith("通り"):
            idx = find_route_index(named_pts[i]["lat"], named_pts[i]["lng"])
            if idx is not None and idx + 1 < len(line_pts_orig):
                p0, p1 = line_pts_orig[idx], line_pts_orig[idx + 1]
                dx, dy = p1[0] - p0[0], p1[1] - p0[1]
                if dx or dy:
                    preferred_angle = math.atan2(dy, dx)
        rect = place_label(draw, mx, my, text, FONT_LABEL, W, H, occupied, line_pts, preferred_angle=preferred_angle)
        occupied.append(rect)
        label_boxes.append((rect, text, (mx, my)))

    # leader lines from each marker to its own label, so the pairing is
    # explicit even when the label sits some distance away
    for rect, text, (mx, my) in label_boxes:
        rcx, rcy = (rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2
        draw.line([(mx, my), (rcx, rcy)], fill=(90, 90, 90), width=2)

    for rect, text, _ in label_boxes:
        draw.rectangle(rect, fill=(255, 255, 255, 235), outline=(90, 90, 90), width=1)
        draw.text((rect[0] + 6, rect[1] + 4), text, font=FONT_LABEL, fill=(20, 20, 20))

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

    img.save(out_path, quality=92)
    print("saved", out_path, img.size)

if __name__ == "__main__":
    render_leg(ROUTE["往路"], POINTS_OUT, "final_outbound2.jpg", (30, 80, 220), pad_px=90)
    render_leg(ROUTE["帰路"], POINTS_RET, "final_return2.jpg", (30, 140, 60), pad_px=90)
