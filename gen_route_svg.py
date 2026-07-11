#!/usr/bin/env python3
# mikoshi-route.dio（draw.ioの図面ソース）をパースし、地図タブで使うmikoshi-route.svgを再生成する。
# mikoshi-route.dioを更新したら実行して同期すること。draw.io本体やNode等の外部ツールは不要（標準ライブラリのみ）。
import html
import re
import xml.etree.ElementTree as ET
from pathlib import Path

DIR = Path(__file__).resolve().parent
SRC = DIR / "mikoshi-route.dio"
OUT = DIR / "mikoshi-route.svg"

FONT_SIZE = 12
LINE_H = 14
PAD = 40


def style_dict(style):
    d = {}
    if not style:
        return d
    for part in style.split(";"):
        part = part.strip()
        if not part:
            continue
        if "=" in part:
            k, v = part.split("=", 1)
            d[k] = v
        else:
            d[part] = True
    return d


BR_RE = re.compile(r"(?i)<br[^>]*>")


def process_segment(raw):
    # A <br> is a real line break, so "text<br>" is two lines ("text", "").
    # But a segment that's *only* br tags (one or several, e.g. the
    # "Apple-interchange-newline" copy-paste artifact) is the idiom for a
    # single blank filler line, not one blank line per br.
    protected = BR_RE.sub("\x00", raw)
    protected = re.sub(r"(?i)</?span[^>]*>", "", protected)
    protected = re.sub(r"<[^>]+>", "", protected)
    protected = html.unescape(protected)
    parts = [p.strip() for p in protected.split("\x00")]
    if len(parts) > 1 and not any(parts):
        return [""]
    return parts


def html_to_lines(value):
    # mxgraph HTML labels use one <div> per line. Text that sits outside any
    # <div> (a "loose" run) still renders on its own line, because a bare
    # inline run sitting between block-level <div> siblings becomes its own
    # anonymous block box in the browser. So: every top-level <div> and every
    # top-level loose-text run is (at least) one line, further split by <br>.
    if not value:
        return []

    tokens = re.split(r"(?i)(<div[^>]*>|</div>)", value)
    lines = []
    buf = []
    depth = 0

    def flush():
        lines.extend(process_segment("".join(buf)))
        buf.clear()

    for tok in tokens:
        if re.match(r"(?i)<div[^>]*>", tok):
            if depth == 0:
                if "".join(buf):
                    flush()
                else:
                    buf.clear()
            depth += 1
        elif tok.lower() == "</div>":
            depth = max(0, depth - 1)
            if depth == 0:
                flush()
        else:
            buf.append(tok)

    if "".join(buf):
        flush()

    return lines


def parse(src_path):
    root = ET.parse(src_path).getroot()
    vertices, edges = [], []

    for cell in root.iter("mxCell"):
        style = style_dict(cell.get("style"))
        geom = cell.find("mxGeometry")
        if geom is None:
            continue

        if cell.get("vertex") == "1":
            vertices.append({
                "x": float(geom.get("x", 0)),
                "y": float(geom.get("y", 0)),
                "w": float(geom.get("width", 0)),
                "h": float(geom.get("height", 0)),
                "fill": style.get("fillColor", "#ffffff"),
                "stroke": style.get("strokeColor", "#000000"),
                "align": style.get("align", "center"),
                "valign": style.get("verticalAlign", "middle"),
                "lines": html_to_lines(cell.get("value")),
            })
        elif cell.get("edge") == "1":
            src = geom.find("mxPoint[@as='sourcePoint']")
            tgt = geom.find("mxPoint[@as='targetPoint']")
            pts = []
            if src is not None:
                pts.append((float(src.get("x")), float(src.get("y"))))
            arr = geom.find("Array[@as='points']")
            if arr is not None:
                for p in arr.findall("mxPoint"):
                    pts.append((float(p.get("x")), float(p.get("y"))))
            if tgt is not None:
                pts.append((float(tgt.get("x")), float(tgt.get("y"))))
            edges.append({
                "pts": pts,
                "stroke": style.get("strokeColor", "#6c8ebf"),
                "dashed": style.get("dashed") == "1",
            })

    return vertices, edges


def bounding_box(vertices, edges):
    xs, ys = [], []
    for v in vertices:
        xs += [v["x"], v["x"] + v["w"]]
        ys += [v["y"], v["y"] + v["h"]]
    for e in edges:
        for (px, py) in e["pts"]:
            xs.append(px)
            ys.append(py)
    return min(xs) - PAD, min(ys) - PAD, max(xs) + PAD, max(ys) + PAD


def render_svg(vertices, edges):
    min_x, min_y, max_x, max_y = bounding_box(vertices, edges)
    vb_w, vb_h = max_x - min_x, max_y - min_y

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x} {min_y} {vb_w} {vb_h}" '
        f'width="{int(vb_w)}" height="{int(vb_h)}" font-family="sans-serif">',
        f'<rect x="{min_x}" y="{min_y}" width="{vb_w}" height="{vb_h}" fill="#ffffff"/>',
        '<defs>'
        '<marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
        '<path d="M0,0 L10,5 L0,10 z" fill="#6c8ebf"/></marker>'
        '<marker id="arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
        '<path d="M0,0 L10,5 L0,10 z" fill="#82b366"/></marker>'
        '</defs>',
    ]

    # edges first, so vertex boxes sit on top
    for e in edges:
        pts = e["pts"]
        if len(pts) < 2:
            continue
        d = "M " + " L ".join(f"{px},{py}" for px, py in pts)
        dash = ' stroke-dasharray="6,4"' if e["dashed"] else ""
        marker = "url(#arrow-green)" if "82b366" in e["stroke"] else "url(#arrow-blue)"
        parts.append(
            f'<path d="{d}" fill="none" stroke="{e["stroke"]}" stroke-width="2.5"{dash} '
            f'marker-end="{marker}" stroke-linecap="round" stroke-linejoin="round"/>'
        )

    for v in vertices:
        x, y, w, h = v["x"], v["y"], v["w"], v["h"]
        # mxgraph's default rectangle style renders white fill + black border
        # even when fillColor/strokeColor are omitted, so always draw the box.
        parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" '
            f'fill="{v["fill"]}" stroke="{v["stroke"]}" stroke-width="1"/>'
        )

        lines = v["lines"]
        if lines:
            text_h = len(lines) * LINE_H
            valign = v["valign"]
            if valign == "top":
                start_y = y + LINE_H * 0.75
            elif valign == "bottom":
                start_y = y + h - text_h + LINE_H * 0.75
            else:
                start_y = y + h / 2 - text_h / 2 + LINE_H * 0.75
            align = v["align"]
            if align == "left":
                tx, anchor = x + 4, "start"
            elif align == "right":
                tx, anchor = x + w - 4, "end"
            else:
                tx, anchor = x + w / 2, "middle"
            parts.append(f'<text x="{tx}" y="{start_y}" font-size="{FONT_SIZE}" text-anchor="{anchor}" fill="#222222">')
            for i, ln in enumerate(lines):
                dy = 0 if i == 0 else LINE_H
                parts.append(f'<tspan x="{tx}" dy="{dy}">{html.escape(ln)}</tspan>')
            parts.append('</text>')

    parts.append('</svg>')
    return "\n".join(parts)


def main():
    vertices, edges = parse(SRC)
    svg = render_svg(vertices, edges)
    OUT.write_text(svg, encoding="utf-8")
    print(f"generated: {OUT} ({len(vertices)} vertices, {len(edges)} edges)")


if __name__ == "__main__":
    main()
