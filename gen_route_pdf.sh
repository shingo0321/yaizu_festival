#!/bin/bash
# route-print.html（mikoshi-route.svgをそのままA4等に縛られず原寸で1ページに収める印刷用ページ）を
# ヘッドレスChromeでPDF化し、mikoshi-route.pdfを再生成する。
# mikoshi-route.svgを再生成したら実行して同期すること。
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$DIR/mikoshi-route.pdf" \
  --virtual-time-budget=3000 \
  "file://$DIR/route-print.html"

echo "generated: $DIR/mikoshi-route.pdf"
