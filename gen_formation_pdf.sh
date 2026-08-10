#!/bin/bash
# route-map-print.html（?srcで渡した画像を原寸1ページのPDFにする印刷用ページ、
# mikoshi-route-outbound/return.pdfの生成にも使っているもの）をヘッドレスChromeで叩き、
# formation_shinji_1〜3.svg / formation_jinjya_syoden.svg / formation_jinjya_koden.svg から
# 対応するPDFを再生成する。SVGを再生成したら実行して同期すること。
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=8791

cd "$DIR"
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null' EXIT
sleep 1

for n in 1 2 3; do
  # Title comes from formation_shinji.md's "# formation_N:タイトル" heading
  # (via apply_formation.py's parser) so the PDF header can't drift from the
  # name shown on the site.
  TITLE=$(python3 -c "
import sys
from urllib.parse import quote
from apply_formation import parse_formation_md, MD_PATH
print(quote(parse_formation_md(MD_PATH)[int(sys.argv[1])][\"title\"]))
" "$n")
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$DIR/formation_shinji_${n}.pdf" \
    --virtual-time-budget=3000 \
    "http://localhost:${PORT}/route-map-print.html?src=formation_shinji_${n}.svg&title=${TITLE}"
  echo "generated: $DIR/formation_shinji_${n}.pdf"
done

# 昇殿/降殿は実名入りの独立した手描き陣形図で、formation_shinji.mdのような
# タイトル定義元が無いため、ここに直接タイトルを書く。macOS標準のbash 3.2は
# 連想配列(declare -A)を使えないため、並行配列で代用する。
JINJYA_NAMES=(formation_jinjya_syoden formation_jinjya_koden)
JINJYA_TITLES=(昇殿 降殿)
for i in "${!JINJYA_NAMES[@]}"; do
  name="${JINJYA_NAMES[$i]}"
  TITLE=$(python3 -c "from urllib.parse import quote; print(quote('${JINJYA_TITLES[$i]}'))")
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$DIR/${name}.pdf" \
    --virtual-time-budget=3000 \
    "http://localhost:${PORT}/route-map-print.html?src=${name}.svg&title=${TITLE}"
  echo "generated: $DIR/${name}.pdf"
done
