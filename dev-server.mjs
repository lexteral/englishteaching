// Local preview only (no Cloudflare needed):  node --env-file=.dev.vars dev-server.mjs
// Production uses Cloudflare Pages, which serves ./public and runs ./functions.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { onRequestPost, onRequest } from "./functions/api/score.js";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".txt": "text/plain", ".svg": "image/svg+xml" };
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/score") {
    const chunks = []; for await (const c of req) chunks.push(c);
    const request = new Request("http://x/api/score", { method: req.method, body: req.method === "POST" ? Buffer.concat(chunks) : undefined });
    const r = await (req.method === "POST" ? onRequestPost({ request, env: process.env }) : onRequest());
    res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(await r.text());
  }
  try {
    const p = url.pathname === "/" ? "/index.html" : url.pathname;
    res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" });
    res.end(await readFile(join("public", p.replace(/\.\./g, ""))));
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(8788, () => console.log("http://localhost:8788"));
