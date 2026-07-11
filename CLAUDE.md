# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, frontend-only website (no build step, no dependencies) for 焼津祭 (Yaizu Festival) showing the schedule/timetable and a map reference. Open `index.html` directly in a browser to preview.

## Architecture

- `data.js` — all content (`roles`, `schedule`, `mapPins`, etc.). This is the **only file meant to be edited** for routine updates; look for `TODO:` markers.
  - `roles` / `schedule` mirror an Excel source file managed in Dropbox — that file is never stored locally; when updating, refer to the Dropbox file directly (the share link is kept privately by the site owner, not documented here).
  - `mapPins.points` is an array of `{ label, lat, lng, mapUrl }`. Rendered as a list in the map tab; `mapUrl` (optional) adds a "view in Google Maps" link. There is currently no interactive map.
  - `mapPins.officialRouteImage` hotlinks a reference image (portable shrine route map) directly from the 焼津神社 official site — no local copy is stored, and the URL changes year to year, so verify it against the official site when updating.
  - `mapPins.excelRouteLine` is leftover data for a previous Leaflet-based interactive map and is currently unused.
- `app.js` — pure rendering of `data.js` content into the DOM; no interactive map logic remains.
- `index.html` / `style.css` — structure and styling; not expected to need changes for routine content updates.
- `gate.js` — client-side password gate shown before `data.js`/`app.js` are loaded (deters casual visitors only; the repo itself must be made private for real access control, since `data.js` remains directly fetchable from a public repo regardless of this gate).
- `print.html` / `gen_schedule_pdf.sh` — generate the printable `schedule.pdf` from `data.js`'s `schedule` via headless Chrome. `print.html` measures actual rendered row heights to auto-paginate onto A4-landscape pages, splitting a day across pages with a `（n/total）` suffix in the heading when it doesn't fit on one page.

## Rules

- **After editing `data.js`'s `schedule`, regenerate the PDF**: run `./gen_schedule_pdf.sh` from this directory to keep `schedule.pdf` in sync. It has drifted out of sync before (edits to `data.js` without regenerating the PDF), so don't skip this.

## Notes

- No test suite, linter, or build/package manifest — intentionally dependency-free static HTML/CSS/JS.
- `焼津祭_2026.xlsx` and `.claude/` are gitignored.
- The current `data.js` schedule intentionally includes personal names/home names at the owner's request — if the visibility scope needs to change, edit that file directly.
