#!/usr/bin/env python3
# formation_shinji_1.dio〜formation_shinji_3.dio（draw.ioの図面ソース、apply_formation.pyが
# formation_shinji.mdの内容を反映して生成）と、実名入りの独立した手描き陣形図である
# formation_jinjya_syoden.dio/formation_jinjya_koden.dio（.mdマッピング不要）をパースし、
# 要綱タブで使うSVGを再生成する。
# mxCellのスキーマはmikoshi-route.dioと同じなので、gen_route_svg.pyのparse/render_svgをそのまま使う。
# 対象の.dioを更新したら実行して同期すること。
from pathlib import Path

from gen_route_svg import parse, render_svg

DIR = Path(__file__).resolve().parent
TARGETS = [
    "formation_shinji_1.dio",
    "formation_shinji_2.dio",
    "formation_shinji_3.dio",
    "formation_jinjya_syoden.dio",
    "formation_jinjya_koden.dio",
]


def main():
    for name in TARGETS:
        src = DIR / name
        vertices, edges = parse(src)
        svg = render_svg(vertices, edges, fit_font=True)
        out = src.with_suffix(".svg")
        out.write_text(svg, encoding="utf-8")
        print(f"generated: {out} ({len(vertices)} vertices, {len(edges)} edges)")


if __name__ == "__main__":
    main()
