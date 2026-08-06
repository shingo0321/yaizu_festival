#!/bin/bash
# route-map-print.html（?srcで渡した画像を原寸1ページのPDFにする印刷用ページ、
# mikoshi-route-outbound/return.pdfの生成にも使っているもの）をヘッドレスChromeで叩き、
# formation_1〜3.svgからformation_1〜3.pdfを再生成する。
# formation_N.svgを再生成したら実行して同期すること。
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
  # Title comes from formation.md's "# formation_N:タイトル" heading (via
  # apply_formation.py's parser) so the PDF header can't drift from the name
  # shown on the site.
  TITLE=$(python3 -c "
import sys
from urllib.parse import quote
from apply_formation import parse_formation_md, MD_PATH
print(quote(parse_formation_md(MD_PATH)[int(sys.argv[1])][\"title\"]))
" "$n")
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$DIR/formation_${n}.pdf" \
    --virtual-time-budget=3000 \
    "http://localhost:${PORT}/route-map-print.html?src=formation_${n}.svg&title=${TITLE}"
  echo "generated: $DIR/formation_${n}.pdf"
done
