#!/usr/bin/env python3
"""Generate gallery.json from every supported image in img/gallery/."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
GALLERY_DIR = ROOT / "img" / "gallery"
OUTPUT = ROOT / "gallery.json"
SUPPORTED = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}

files = sorted(
    (p.relative_to(ROOT).as_posix() for p in GALLERY_DIR.iterdir() if p.is_file() and p.suffix.lower() in SUPPORTED),
    key=lambda s: (s.lower(), s),
)

OUTPUT.write_text(json.dumps(files, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Generated {OUTPUT.name} with {len(files)} images.")
