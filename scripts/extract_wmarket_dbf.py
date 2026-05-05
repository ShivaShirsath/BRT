from __future__ import annotations
import json
import struct
from pathlib import Path
from typing import Dict, List, Any

ROOT = Path('/Users/shiva/Downloads/wmarket/DATA')
OUT = Path('/Users/shiva/Downloads/wmarket/BRT/src/data/wmarket_seed.json')

TABLES = {
    'customers': 'CUST2601.DBF',
    'suppliers': 'SUPP2601.DBF',
    'stock': 'STOK2601.DBF',
    'cont': 'CONT2601.DBF',
    'ledger': 'GL2601.DBF',
}


def parse_dbf(path: Path, limit: int = 300) -> List[Dict[str, Any]]:
    with path.open('rb') as f:
        header = f.read(32)
        if len(header) < 32:
            return []
        num_records = struct.unpack('<I', header[4:8])[0]
        header_len = struct.unpack('<H', header[8:10])[0]
        record_len = struct.unpack('<H', header[10:12])[0]

        fields = []
        while True:
            desc = f.read(32)
            if not desc or desc[0] == 0x0D:
                break
            name = desc[0:11].split(b'\x00', 1)[0].decode('ascii', errors='ignore').strip()
            ftype = chr(desc[11])
            flen = desc[16]
            fdec = desc[17]
            fields.append((name, ftype, flen, fdec))

        f.seek(header_len)

        rows: List[Dict[str, Any]] = []
        for _ in range(min(num_records, limit)):
            rec = f.read(record_len)
            if len(rec) < record_len:
                break
            if rec[0:1] == b'*':
                continue
            offset = 1
            row: Dict[str, Any] = {}
            for name, ftype, flen, fdec in fields:
                raw = rec[offset:offset + flen]
                offset += flen
                txt = raw.decode('latin-1', errors='ignore').strip()
                if ftype == 'C':
                    row[name] = txt
                elif ftype in ('N', 'F'):
                    if txt == '':
                        row[name] = None
                    else:
                        try:
                            row[name] = float(txt) if fdec > 0 else int(float(txt))
                        except ValueError:
                            row[name] = txt
                elif ftype == 'D':
                    if len(txt) == 8 and txt.isdigit():
                        row[name] = f"{txt[0:4]}-{txt[4:6]}-{txt[6:8]}"
                    else:
                        row[name] = txt
                elif ftype == 'L':
                    row[name] = txt.upper() in {'Y', 'T'}
                else:
                    row[name] = txt
            rows.append(row)
        return rows


def pick(rows: List[Dict[str, Any]], cols: List[str]) -> List[Dict[str, Any]]:
    return [{c: r.get(c) for c in cols} for r in rows]


def main() -> None:
    raw = {k: parse_dbf(ROOT / v) if (ROOT / v).exists() else [] for k, v in TABLES.items()}

    shaped = {
        'customers': pick(raw['customers'], ['ACNO', 'NAME', 'CITY', 'PHONE', 'CLBALANCE']),
        'suppliers': pick(raw['suppliers'], ['ACNO', 'NAME', 'CITY', 'PHONE', 'CLBALANCE']),
        'stock': pick(raw['stock'], ['RECD_ITEM', 'RECD_NAME', 'RECD_QTY', 'SALE_QTY', 'BAL_QTY', 'EFF_VAL']),
        'cont': pick(raw['cont'], ['DATE', 'SRNO', 'ACNO', 'RECEIVED', 'SEND', 'CHALLAN_NO', 'SALE_AMT', 'VEH_NO']),
        'ledger': pick(raw['ledger'], ['DATE', 'ACNO', 'DESC', 'AMOUNT', 'CD', 'MODULE', 'DOC_NO']),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(shaped, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"Wrote seed data: {OUT}")
    for k, v in shaped.items():
        print(f"{k}: {len(v)} rows")


if __name__ == '__main__':
    main()
