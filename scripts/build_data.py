#!/usr/bin/env python3
"""Convert the OMR score sheet (.xlsx) into an AES-256-GCM encrypted data file.

Usage:
    python3 scripts/build_data.py path/to/scores.xlsx            # new random key
    DATA_KEY=<base64 key> python3 scripts/build_data.py scores.xlsx   # reuse a key

Output: functions/_lib/scores.enc.json  (safe to commit - unreadable without DATA_KEY)
The key is printed once. Store it as the DATA_KEY secret on the host; never commit it.

Column mapping (raw = number correct out of 100 -> % correct -> ETS table):
    Subj_1#Obj_01 -> Listening scaled score
    Subj_1#Obj_02 -> Reading scaled score
"""
import base64, json, os, secrets, sys, warnings
from pathlib import Path
import openpyxl
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ITEMS = 100  # questions per section (Listening / Reading)
ROOT = Path(__file__).resolve().parent.parent
TABLE = json.loads((ROOT / "scripts" / "toeic_conversion.json").read_text())


def scaled(raw: int, section: str) -> int:
    pct = round(raw * 100 / ITEMS)
    return TABLE[str(min(max(pct, 1), 100))][section]


def main(xlsx: str) -> None:
    warnings.simplefilter("ignore")
    ws = openpyxl.load_workbook(xlsx, data_only=True).active
    header = None
    out, seen = {}, set()
    for row in ws.iter_rows(values_only=True):
        if header is None:
            if row and "Subj_1#Obj_01" in row:
                header = {name: i for i, name in enumerate(row) if name}
            continue
        sid = str(row[header["ID"]] or "").strip()
        if not sid:
            continue
        if sid in seen:
            sys.exit(f"Duplicate student ID: {sid}")
        seen.add(sid)
        lr, rr = int(row[header["Subj_1#Obj_01"]]), int(row[header["Subj_1#Obj_02"]])
        ls, rs = scaled(lr, "L"), scaled(rr, "R")
        out[sid] = {
            "name": f'{row[header["Innitial"]] or ""}{row[header["First Name"]] or ""}'.strip(),
            "major": str(row[header["Seat"]] or "").replace("วิชาเอก", "").strip(),
            "l": {"raw": lr, "scaled": ls},
            "r": {"raw": rr, "scaled": rs},
            "total": ls + rs,
        }
    key = base64.b64decode(os.environ["DATA_KEY"]) if os.environ.get("DATA_KEY") else secrets.token_bytes(32)
    iv = secrets.token_bytes(12)
    ct = AESGCM(key).encrypt(iv, json.dumps(out, ensure_ascii=False, separators=(",", ":")).encode(), None)
    dest = ROOT / "functions" / "_lib" / "scores.enc.json"
    dest.write_text(json.dumps({"v": 1, "iv": base64.b64encode(iv).decode(), "ct": base64.b64encode(ct).decode()}))
    print(f"Wrote {dest.relative_to(ROOT)}  ({len(out)} students)")
    if not os.environ.get("DATA_KEY"):
        print("DATA_KEY =", base64.b64encode(key).decode())


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
