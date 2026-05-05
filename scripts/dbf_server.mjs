import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { DBFFile } from 'dbffile';

const HOST = '127.0.0.1';
const PORT = 4001;
const DATA_DIR = '/Users/shiva/Downloads/wmarket/DATA';
const RELATION_KEYS = ['ACNO', 'BYTOACNO', 'CHALLAN_NO', 'SRNO', 'DOC_NO', 'RECD_ITEM'];

let catalogCache = null;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function parseNum(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function loadCatalog() {
  if (catalogCache) return catalogCache;

  const files = (await fs.readdir(DATA_DIR))
    .filter((f) => f.toUpperCase().endsWith('.DBF'))
    .sort((a, b) => a.localeCompare(b));

  const tables = [];
  for (const file of files) {
    const fullPath = path.join(DATA_DIR, file);
    try {
      const dbf = await DBFFile.open(fullPath);
      const fields = dbf.fields.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      }));
      tables.push({
        table: file,
        path: fullPath,
        recordCount: dbf.recordCount,
        fieldCount: fields.length,
        fields,
      });
    } catch {
      // Skip unreadable DBF files.
    }
  }

  catalogCache = {
    source: DATA_DIR,
    generatedAt: new Date().toISOString(),
    tables,
  };

  return catalogCache;
}

function inferRelationsFor(table, tables) {
  const own = new Set(table.fields.map((f) => String(f.name).toUpperCase()));
  const relations = [];

  for (const key of RELATION_KEYS) {
    if (!own.has(key)) continue;
    for (const other of tables) {
      if (other.table === table.table) continue;
      const otherSet = new Set(other.fields.map((f) => String(f.name).toUpperCase()));
      if (otherSet.has(key)) {
        relations.push({
          key,
          targetTable: other.table,
          targetKey: key,
          relationType: 'inferred',
        });
      }
    }
  }

  return relations;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

  try {
    if (url.pathname === '/api/dbf/files') {
      const catalog = await loadCatalog();
      return sendJson(res, 200, {
        source: catalog.source,
        generatedAt: catalog.generatedAt,
        tables: catalog.tables.map((t) => ({
          table: t.table,
          recordCount: t.recordCount,
          fieldCount: t.fieldCount,
        })),
      });
    }

    if (url.pathname === '/api/dbf/table') {
      const name = url.searchParams.get('name');
      const page = Math.max(1, parseNum(url.searchParams.get('page'), 1));
      const pageSize = Math.min(200, Math.max(10, parseNum(url.searchParams.get('pageSize'), 50)));

      if (!name) {
        return sendJson(res, 400, { error: 'name is required' });
      }

      const catalog = await loadCatalog();
      const table = catalog.tables.find((t) => t.table === name);
      if (!table) {
        return sendJson(res, 404, { error: `Table not found: ${name}` });
      }

      const dbf = await DBFFile.open(table.path);
      const offset = (page - 1) * pageSize;
      const rows = await dbf.readRecords(pageSize, offset);
      const totalPages = Math.max(1, Math.ceil(table.recordCount / pageSize));
      const relations = inferRelationsFor(table, catalog.tables);

      return sendJson(res, 200, {
        source: catalog.source,
        table: table.table,
        recordCount: table.recordCount,
        fieldCount: table.fieldCount,
        fields: table.fields,
        relations,
        page,
        pageSize,
        totalPages,
        rows,
      });
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`DBF server running at http://${HOST}:${PORT}`);
});
