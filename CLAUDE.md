# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, frontend-only website (no build step, no dependencies) for 焼津祭 (Yaizu Festival) showing the schedule/timetable and a map reference. Open `index.html` directly in a browser to preview.

## Architecture

- `data.js` — all content (`roles`, `schedule`, `mapPins`, etc.). This is the **only file meant to be edited** for routine updates; look for `TODO:` markers.
  - `roles` / `schedule` mirror an Excel source file managed in Dropbox — that file is never stored locally; when updating, refer to the Dropbox file directly (the share link is kept privately by the site owner, not documented here).
  - `mapPins.points` is an array of `{ label, lat, lng, mapUrl }`. Rendered as a list in the map tab; `mapUrl` (optional) adds a "view in Google Maps" link. There is currently no interactive map.
  - `mapPins.routeDiagram` renders a locally stored simplified route diagram (`mikoshi-route.svg`, blue=往路/green=帰路) above the official reference image in the map tab, plus a "簡略図のPDFを開く" link to `mikoshi-route.pdf`. The SVG is generated from `mikoshi-route.dio` (a draw.io source file) by `gen_route_svg.py`; the PDF is generated from the SVG by `gen_route_pdf.sh`.
  - `mapPins.officialRouteImage` hotlinks a reference image (portable shrine route map) directly from the 焼津神社 official site — no local copy is stored, and the URL changes year to year, so verify it against the official site when updating.
  - `mapPins.excelRouteLine` is leftover data for a previous Leaflet-based interactive map and is currently unused.
  - `mikoshi-route-reference.jpg` is a downloaded copy of the official route map kept for provenance/comparison — untracked, not referenced by the site.
- `app.js` — pure rendering of `data.js` content into the DOM; no interactive map logic remains.
- `index.html` / `style.css` — structure and styling; not expected to need changes for routine content updates.
- `gate.js` — client-side password gate shown before `data.js`/`app.js` are loaded (deters casual visitors only; the repo itself must be made private for real access control, since `data.js` remains directly fetchable from a public repo regardless of this gate).
- `print.html` / `gen_schedule_pdf.sh` — generate the printable `schedule.pdf` from `data.js`'s `schedule` via headless Chrome. `print.html` measures actual rendered row heights to auto-paginate onto A4-landscape pages, splitting a day across pages with a `（n/total）` suffix in the heading when it doesn't fit on one page.
- `mikoshi-route.dio` / `gen_route_svg.py` — `gen_route_svg.py` parses the draw.io XML (`mxCell` vertices/edges: box position, fill/stroke color, and text; edge source/waypoints/target) with Python's stdlib only (no draw.io app, Node, or network access needed) and renders it straight to `mikoshi-route.svg`.
- `mikoshi-route.md` — human-readable list of the 往路 (outbound) mikoshi route, grouped by named stop, each with one or more Google Maps share links (`maps.app.goo.gl/...`). The first link under each named stop is the source of truth for that stop's entry in `data.js`'s `mapPins.points` (label + `mapUrl`); bare links with no stop name above them are reference-only and not reflected in `mapPins.points`. Like `mikoshi-route.dio`, this is a live file the owner may edit directly between (or within) sessions.
- `route-print.html` / `gen_route_pdf.sh` — generate `mikoshi-route.pdf` from `mikoshi-route.svg` via headless Chrome. `route-print.html` sizes `@page` to the SVG's own pixel dimensions (read via the loaded `<img>`'s `naturalWidth`/`naturalHeight`) so the PDF is one page at the diagram's native aspect ratio, not cropped/scaled to A4.

## Rules

- **After editing `data.js`'s `schedule`, regenerate the PDF**: run `./gen_schedule_pdf.sh` from this directory to keep `schedule.pdf` in sync. It has drifted out of sync before (edits to `data.js` without regenerating the PDF), so don't skip this — including when `schedule` changes as a side effect of other work, not just when explicitly asked to edit it. When in doubt, check `git diff data.js` for `schedule` changes before wrapping up.
- **After editing `mikoshi-route.dio`, regenerate the SVG**: run `./gen_route_svg.py` from this directory to keep `mikoshi-route.svg` in sync with the diagram source.
- **After regenerating `mikoshi-route.svg`, regenerate the PDF too**: run `./gen_route_pdf.sh` from this directory to keep `mikoshi-route.pdf` in sync.
- **`mikoshi-route.dio` is a live file the owner edits directly in the draw.io desktop app between Claude sessions** (and sometimes between messages in the same session), not just through requests made here. Before doing route-diagram work — and especially when asked to "reflect the dio changes" — run `git diff mikoshi-route.dio` first rather than assuming it's unchanged; regenerate the SVG whenever it has changed, even if no one explicitly flagged an edit.
- **After editing `mikoshi-route.md`, sync `data.js`'s `mapPins.points`**: for each named stop, the label and its first `mapUrl` under that stop should match a `{ label, lat, lng, mapUrl }` entry in `mapPins.points`, in the same order (drop stops entirely if removed from the .md; add new ones with `lat`/`lng` resolved from the `mapUrl` redirect target, which contains `lat,lng`). Bare links with no stop name stay out of `mapPins.points`. `mikoshi-route.md` is also a file the owner may edit directly between/within sessions — run `git diff mikoshi-route.md` before wrapping up any route-related work, the same way `mikoshi-route.dio` is checked, and resync even if no one explicitly flagged an edit.

## Notes

- No test suite, linter, or build/package manifest — intentionally dependency-free static HTML/CSS/JS.
- `焼津祭_2026.xlsx` and `.claude/` are gitignored.
- The current `data.js` schedule intentionally includes personal names/home names at the owner's request — if the visibility scope needs to change, edit that file directly.
