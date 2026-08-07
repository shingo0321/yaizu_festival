#!/usr/bin/env python3
# formation_1.dio〜formation_3.dio（draw.ioの図面ソース、apply_formation.pyがformation.mdの内容を
# 反映して生成）をパースし、要綱タブで使うformation_N.svgを再生成する。
# mxCellのスキーマはmikoshi-route.dioと同じなので、gen_route_svg.pyのparse/render_svgをそのまま使う。
# formation_1〜3.dioを更新したら実行して同期すること。
from pathlib import Path

from gen_route_svg import parse, render_svg

DIR = Path(__file__).resolve().parent
TARGETS = ["formation_1.dio", "formation_2.dio", "formation_3.dio"]


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
