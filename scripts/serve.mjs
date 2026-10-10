import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root = new URL('../public/', import.meta.url);
const types = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', svg: 'image/svg+xml' };
const files = new Set(['index.html', 'styles.css', 'app.js', 'game.js', 'favicon.svg']);
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!files.has(name)) { res.writeHead(404); return res.end('Not found'); }
  try {
    const body = await readFile(new URL(name, root));
    res.writeHead(200, { 'Content-Type': types[name.split('.').pop()], 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(500); res.end('Could not load file'); }
}).listen(port, '127.0.0.1', () => console.log(`Telestrations: http://127.0.0.1:${port}`));
