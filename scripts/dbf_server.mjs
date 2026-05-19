import http from 'node:http';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { DBFFile } from 'dbffile';

const HOST = '127.0.0.1';
const PORT = 4001;
const DATA_DIR = '/Users/shiva/Downloads/wmarket/DATA';
const AUTH_TABLE = '/Users/shiva/Downloads/wmarket/DATA/MAST2601.DBF';
const RELATION_KEYS = ['ACNO', 'BYTOACNO', 'CHALLAN_NO', 'SRNO', 'DOC_NO', 'RECD_ITEM'];

let catalogCache = null;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

async function loadFirms() {
  const candidates = ['CUST2601.DBF', 'MAST2601.DBF', 'SUPP2601.DBF'];
  const generic = new Set([
    'SUPPLIER ACCOUNTS',
    'CUSTOMER ACCOUNTS',
    'BANK ACCOUNTS',
    'CASH ACCOUNT',
    'ASSET ACCOUNTS',
    'OPENING BALANCE DIFFERENCE',
    'TRANSACTION ACCOUNT',
  ]);
  const values = [];

  for (const tableName of candidates) {
    const fullPath = path.join(DATA_DIR, tableName);
    try {
      const dbf = await DBFFile.open(fullPath);
      const rows = await dbf.readRecords(dbf.recordCount);
      for (const row of rows) {
        const raw = String(row.NAME ?? '').trim();
        if (!raw) continue;
        const upper = raw.toUpperCase();
        if (raw.length < 4) continue;
        if (generic.has(upper)) continue;
        values.push(raw);
      }
    } catch {
      // ignore table-level errors and continue
    }
  }

  const preferred = values.filter((name) => /BRT|TRADING|CO\.|COMPANY/i.test(name));
  const pool = preferred.length ? preferred : values;
  const deduped = [...new Set(pool.map((name) => name.toUpperCase()))]
    .map((upper) => pool.find((n) => n.toUpperCase() === upper))
    .filter(Boolean);

  if (!deduped.length) return ['BRT TRADING CO.'];
  return deduped.slice(0, 12);
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

  if (req.method === 'POST' && req.url === '/api/auth/login') {
    try {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const userId = String(payload.userId || '').trim().toUpperCase();
          const password = String(payload.password || '').trim();

          if (!userId) {
            return sendJson(res, 400, { error: 'userId is required' });
          }

          const dbf = await DBFFile.open(AUTH_TABLE);
          const rows = await dbf.readRecords(dbf.recordCount);
          const candidates = rows.filter((r) => String(r.USERID || '').trim().toUpperCase() === userId);

          if (!candidates.length) {
            return sendJson(res, 401, { error: 'Invalid user' });
          }

          // Real DB note: PWD is mostly empty in this dataset, so user existence is the primary check.
          const hasPwdValue = candidates.some((r) => String(r.PWD || '').trim().length > 0);
          if (hasPwdValue) {
            const ok = candidates.some((r) => String(r.PWD || '').trim() === password);
            if (!ok) {
              return sendJson(res, 401, { error: 'Invalid password' });
            }
          }

          return sendJson(res, 200, {
            ok: true,
            userId,
            authMode: hasPwdValue ? 'user+password' : 'user-only',
          });
        } catch (error) {
          return sendJson(res, 400, { error: 'Invalid request payload', detail: String(error) });
        }
      });
      return;
    } catch (error) {
      return sendJson(res, 500, { error: 'Auth error', detail: String(error) });
    }
  }

  if (req.method === 'POST' && req.url.startsWith('/api/dbf/upload')) {
    try {
      const url = new URL(req.url, `http://${HOST}:${PORT}`);
      const name = url.searchParams.get('name');
      if (!name) return sendJson(res, 400, { error: 'name query parameter required' });

      const outPath = path.join(DATA_DIR, name);
      const writeStream = fsSync.createWriteStream(outPath);
      req.pipe(writeStream);
      
      req.on('end', () => {
        catalogCache = null; // Invalidate cache so it reloads new files
        sendJson(res, 200, { ok: true, name });
      });
      req.on('error', (err) => {
        sendJson(res, 500, { error: 'Upload failed', detail: String(err) });
      });
      return;
    } catch (err) {
      return sendJson(res, 500, { error: 'Upload failed', detail: String(err) });
    }
  }

  if (req.method === 'POST' && req.url === '/api/dbf/export') {
    try {
      const exportDir = path.join(DATA_DIR, 'exports');
      await fs.mkdir(exportDir, { recursive: true });
      const catalog = await loadCatalog();
      
      const results = [];
      for (const t of catalog.tables) {
        try {
          const dbf = await DBFFile.open(t.path);
          const rows = await dbf.readRecords(dbf.recordCount);
          const jsonName = t.table.replace(/\.dbf$/i, '.json');
          await fs.writeFile(path.join(exportDir, jsonName), JSON.stringify(rows, null, 2));
          results.push(jsonName);
        } catch (err) {
          // ignore individual failures
        }
      }
      return sendJson(res, 200, { ok: true, exportDir, exported: results.length });
    } catch (err) {
      return sendJson(res, 500, { error: 'Export failed', detail: String(err) });
    }
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

    if (url.pathname === '/api/dbf/firms') {
      const firms = await loadFirms();
      return sendJson(res, 200, { firms });
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
