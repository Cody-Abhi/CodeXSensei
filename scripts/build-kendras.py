#!/usr/bin/env python3
"""
build-kendras.py — build data/kendras.json for the DawaDekho Kendra locator.

Pipeline (reproducible; needs internet):
  1. Download the all-India Jan Aushadhi Kendra list PDF.
  2. Extract rows with pdfplumber (Sr.No, Kendra Code, Name, Contact, State,
     District, PIN, Address).
  3. Filter to District == Lucknow, keep 30-60 Kendras.
  4. Geocode each address with OpenStreetMap Nominatim (max 1 req/sec, a real
     User-Agent). If the address fails, fall back to geocoding the PIN code and
     set "approx_location": true.
  5. Write data/kendras.json (array), and print the OSM/ODbL attribution.

Data credits:
  - Kendra records: Jan Aushadhi Kendra list PDF (PMBI), snapshot date below.
  - Coordinates: © OpenStreetMap contributors, ODbL (geocoded via Nominatim).

IMPORTANT: Do NOT geocode with Mapbox and store the result — Mapbox's standard
(temporary) geocoding results may not be persisted. Nominatim/OSM (ODbL) may be.

Usage:
  pip install pdfplumber requests
  python3 scripts/build-kendras.py \
      --pdf-url "https://sarkariyojana.com/wp-content/uploads/2025/10/jan-aushadhi-kendra-list.pdf" \
      --district Lucknow --limit 50
"""

import argparse
import json
import os
import re
import sys
import time
from urllib.parse import urlencode

SNAPSHOT_DATE = "2025-10-01"  # the PDF is dated Oct 2025
NOMINATIM = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "DawaDekho/1.0 (hackathon; +https://github.com/cody-abhi/codexsensei)"

# Lucknow bounding box, used to sanity-check geocodes.
LKO_BBOX = {"min_lat": 26.65, "max_lat": 27.05, "min_lng": 80.80, "max_lng": 81.15}
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "kendras.json")


def log(*a):
    print(*a, file=sys.stderr)


def download_pdf(url, dest):
    import requests
    log(f"Downloading {url} ...")
    r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=60)
    r.raise_for_status()
    with open(dest, "wb") as f:
        f.write(r.content)
    log(f"Saved {len(r.content)} bytes to {dest}")


# Header names we try to recognise in the PDF table.
HEADERS = ["sr", "code", "name", "contact", "state", "district", "pin", "address"]


def extract_rows(pdf_path):
    import pdfplumber

    rows = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                for raw in table:
                    cells = [(" ".join((c or "").split())) for c in raw]
                    if not any(cells):
                        continue
                    rows.append(cells)
    log(f"Extracted {len(rows)} raw rows")
    return rows


def pick(cells, idx):
    return cells[idx] if idx is not None and idx < len(cells) else ""


def row_to_record(cells):
    """Best-effort map of a cell list to a Kendra record.

    PDF layouts vary; this assumes columns roughly in HEADERS order and is
    defensive about short rows. Adjust indices if your PDF differs.
    """
    # Heuristic: find a PIN (6 digits) and a kendra code (alnum) in the row.
    joined = " | ".join(cells)
    pin_m = re.search(r"\b(\d{6})\b", joined)
    code_m = re.search(r"\b(PMBJK\w+|\w*\d{3,}\w*)\b", cells[1] if len(cells) > 1 else "")
    pin = pin_m.group(1) if pin_m else ""
    # Columns (fall back gracefully)
    rec = {
        "code": pick(cells, 1).strip(),
        "name": pick(cells, 2).strip(),
        "phone": pick(cells, 3).strip() or None,
        "state": pick(cells, 4).strip(),
        "district": pick(cells, 5).strip(),
        "pin": pin,
        "address": pick(cells, 7).strip() or pick(cells, 6).strip(),
    }
    return rec


def geocode(query, email=None):
    import requests

    params = {"format": "json", "q": query, "limit": 1, "countrycodes": "in"}
    url = NOMINATIM + "?" + urlencode(params)
    r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    r.raise_for_status()
    data = r.json()
    if not data:
        return None
    return float(data[0]["lat"]), float(data[0]["lon"])


def in_bbox(lat, lng):
    return (LKO_BBOX["min_lat"] <= lat <= LKO_BBOX["max_lat"] and
            LKO_BBOX["min_lng"] <= lng <= LKO_BBOX["max_lng"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf-url", required=False)
    ap.add_argument("--pdf-file", required=False, help="use a local PDF instead of downloading")
    ap.add_argument("--district", default="Lucknow")
    ap.add_argument("--limit", type=int, default=50)
    args = ap.parse_args()

    pdf_path = args.pdf_file or os.path.join(os.path.dirname(__file__), "_kendra-list.pdf")
    if not args.pdf_file:
        if not args.pdf_url:
            log("Provide --pdf-url or --pdf-file")
            sys.exit(2)
        download_pdf(args.pdf_url, pdf_path)

    rows = extract_rows(pdf_path)
    records = [row_to_record(c) for c in rows]
    # Filter to the district, drop header/garbage rows.
    district = args.district.lower()
    records = [r for r in records
               if r["district"].lower() == district and r["name"] and r["pin"]]
    # De-dupe by (name, pin)
    seen, uniq = set(), []
    for r in records:
        key = (r["name"].lower(), r["pin"])
        if key in seen:
            continue
        seen.add(key)
        uniq.append(r)
    records = uniq[: args.limit]
    log(f"{len(records)} {args.district} Kendras after filter/de-dupe")

    out = []
    for i, r in enumerate(records, 1):
        latlng = None
        approx = False
        try:
            latlng = geocode(f"{r['address']}, {r['district']}, {r['pin']}, India")
        except Exception as e:
            log(f"  geocode error for {r['name']}: {e}")
        time.sleep(1.1)  # Nominatim: max ~1 req/sec
        if not latlng or not in_bbox(*latlng):
            # Fall back to the PIN centroid.
            try:
                latlng = geocode(f"{r['pin']}, {r['district']}, Uttar Pradesh, India")
                approx = True
            except Exception as e:
                log(f"  PIN geocode error for {r['name']}: {e}")
            time.sleep(1.1)
        if not latlng or not in_bbox(*latlng):
            log(f"  SKIP (no usable geocode): {r['name']}")
            continue
        out.append({
            "code": r["code"] or f"LKO-{i:03d}",
            "name": r["name"],
            "address": r["address"],
            "pin": r["pin"],
            "phone": r["phone"],
            "lat": round(latlng[0], 6),
            "lng": round(latlng[1], 6),
            "approx_location": approx,
        })
        log(f"  [{len(out)}] {r['name']} -> {out[-1]['lat']},{out[-1]['lng']}"
            + (" (approx)" if approx else ""))

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    log(f"\nWrote {len(out)} Kendras to {OUT_PATH}")
    log(f"Snapshot: {SNAPSHOT_DATE}. Coordinates: © OpenStreetMap contributors, ODbL.")


if __name__ == "__main__":
    main()
