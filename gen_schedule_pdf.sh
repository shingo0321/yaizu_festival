#!/bin/bash
# print.html（data.jsの内容を印刷用に整形したページ）をヘッドレスChromeでPDF化し、
# schedule.pdfを再生成する。data.jsのscheduleを変更したら実行して同期すること。
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$DIR/schedule.pdf" \
  "file://$DIR/print.html"

echo "generated: $DIR/schedule.pdf"
