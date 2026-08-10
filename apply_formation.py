#!/usr/bin/env python3
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape

BASE = Path(__file__).parent
MD_PATH = BASE / "formation_shinji.md"
SOURCE_DIO = BASE / "formation_shinji.dio"
TARGETS = {1: "formation_shinji_1.dio", 2: "formation_shinji_2.dio", 3: "formation_shinji_3.dio"}

NUM_CELL_RE = re.compile(
    r'(value="&lt;span style=&quot;font-size: 11px;&quot;&gt;)(\d+)(&lt;/span&gt;")'
)


HEADING_RE = re.compile(r"^#\s*formation_(\d+)\s*(?::\s*(.*?)\s*)?$", re.M)


def parse_formation_md(path):
    text = path.read_text(encoding="utf-8")
    sections = {}
    matches = list(HEADING_RE.finditer(text))
    for i, m in enumerate(matches):
        num = int(m.group(1))
        title = m.group(2) or ""
        body = text[m.end():matches[i + 1].start() if i + 1 < len(matches) else len(text)]
        mapping = {}
        for mm in re.finditer(r"(\d+)\s*:\s*([^\s,]+)", body):
            mapping[int(mm.group(1))] = mm.group(2)
        sections[num] = {"title": title, "mapping": mapping}
    return sections


def apply(dio_path, mapping):
    # Always start from formation_shinji.dio (the numbered source of truth),
    # never from a previously-generated formation_shinji_N.dio, whose number
    # boxes have already been overwritten with content and would no longer
    # match NUM_CELL_RE on a second run.
    text = SOURCE_DIO.read_text(encoding="utf-8")

    def repl(m):
        num = int(m.group(2))
        name = mapping.get(num)
        content = f"{num}.{name}" if name else str(num)
        content = escape(content, {'"': "&quot;"})
        return m.group(1) + content + m.group(3)

    dio_path.write_text(NUM_CELL_RE.sub(repl, text), encoding="utf-8")


def main():
    sections = parse_formation_md(MD_PATH)
    for num, filename in TARGETS.items():
        section = sections.get(num)
        if section is None:
            print(f"warning: formation.md has no section for formation_{num}", file=sys.stderr)
            continue
        apply(BASE / filename, section["mapping"])
        print(f"updated {filename} ({section['title'] or 'no title'})")


if __name__ == "__main__":
    main()
