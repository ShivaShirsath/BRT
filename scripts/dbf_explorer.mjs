import { DBFFile } from 'dbffile';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = '/Users/shiva/Downloads/wmarket/DATA';
const OUT_JSON = '/Users/shiva/Downloads/wmarket/BRT/src/data/wmarket_live_db.json';
const OUT_MD = '/Users/shiva/Downloads/wmarket/BRT/src/data/wmarket_live_db.md';

const TABLE_PATTERNS = [/^CUST\d+\.DBF$/i, /^SUPP\d+\.DBF$/i, /^CONT\d+\.DBF$/i, /^GL\d+\.DBF$/i, /^STOK\d+\.DBF$/i];
const RELATION_KEYS = ['ACNO', 'BYTOACNO', 'CHALLAN_NO', 'SRNO', 'DOC_NO', 'RECD_ITEM'];

function pickNewestByName(files) {
  const grouped = new Map();
  for (const f of files) {
    const prefix = f.replace(/\d+\.DBF$/i, '').toUpperCase();
    const suffix = Number((f.match(/(\d+)\.DBF$/i) || [])[1] || 0);
    const prev = grouped.get(prefix);
    if (!prev || suffix > prev.suffix) {
      grouped.set(prefix, { file: f, suffix });
    }
  }
  return Array.from(grouped.values()).map((v) => v.file);
}

async function main() {
  const all = await fs.readdir(DATA_DIR);
  const target = all.filter((f) => TABLE_PATTERNS.some((p) => p.test(f)));
  const chosen = pickNewestByName(target).sort();

  const db = {
    source: DATA_DIR,
    generatedAt: new Date().toISOString(),
    tables: [],
  };

  for (const file of chosen) {
    const full = path.join(DATA_DIR, file);
    const dbf = await DBFFile.open(full);
    const records = await dbf.readRecords(dbf.recordCount);
    db.tables.push({
      table: file,
      recordCount: dbf.recordCount,
      fieldCount: dbf.fields.length,
      fields: dbf.fields.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
      rows: records,
      relations: [],
    });
  }

  const fieldMap = new Map(
    db.tables.map((t) => [t.table, new Set(t.fields.map((f) => String(f.name).toUpperCase()))]),
  );

  for (const table of db.tables) {
    const own = fieldMap.get(table.table) || new Set();
    const relations = [];
    for (const key of RELATION_KEYS) {
      if (!own.has(key)) continue;
      for (const other of db.tables) {
        if (other.table === table.table) continue;
        const otherFields = fieldMap.get(other.table) || new Set();
        if (otherFields.has(key)) {
          relations.push({
            key,
            targetTable: other.table,
            targetKey: key,
            relationType: 'inferred',
          });
        }
      }
    }
    table.relations = relations;
  }

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(db, null, 2), 'utf8');

  const lines = [];
  lines.push('# WMARKET Live DB Preview');
  lines.push('');
  lines.push(`Source: ${DATA_DIR}`);
  lines.push(`Generated: ${db.generatedAt}`);
  lines.push('');

  for (const t of db.tables) {
    lines.push(`## ${t.table}`);
    lines.push(`- Records: ${t.recordCount}`);
    lines.push(`- Fields: ${t.fieldCount}`);
    lines.push('');
    lines.push('### Columns');
    lines.push('| Name | Type | Size |');
    lines.push('|---|---|---:|');
    for (const f of t.fields) {
      lines.push(`| ${f.name} | ${f.type} | ${f.size} |`);
    }
    lines.push('');
    lines.push('### Rows (all)');
    lines.push('```json');
    lines.push(JSON.stringify(t.rows, null, 2));
    lines.push('```');
    lines.push('');
    lines.push('### Inferred Relations');
    if (!t.relations.length) {
      lines.push('- none');
    } else {
      lines.push('| Key | Target Table | Target Key | Type |');
      lines.push('|---|---|---|---|');
      for (const r of t.relations) {
        lines.push(`| ${r.key} | ${r.targetTable} | ${r.targetKey} | ${r.relationType} |`);
      }
    }
    lines.push('');
  }

  await fs.writeFile(OUT_MD, lines.join('\n'), 'utf8');

  console.log(`Generated ${OUT_JSON}`);
  console.log(`Generated ${OUT_MD}`);
  for (const t of db.tables) {
    console.log(`${t.table}: records=${t.recordCount}, fields=${t.fieldCount}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
