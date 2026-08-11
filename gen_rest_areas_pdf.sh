#!/bin/bash
# rest-areas-print.html（data.jsのmapPins.restAreasを印刷用に整形したページ）を
# ヘッドレスChromeでPDF化し、rest-areas.pdfを再生成する。
# data.jsのmapPins.restAreasを変更したら実行して同期すること。
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$DIR/rest-areas.pdf" \
  "file://$DIR/rest-areas-print.html"

echo "generated: $DIR/rest-areas.pdf"
