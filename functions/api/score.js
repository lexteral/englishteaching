// POST /api/score  { "id": "67100057" }  ->  that student's own result only.
// All records live encrypted in scores.enc.json; DATA_KEY (secret env var) decrypts them
// server-side, so the browser never receives anyone else's data.
import payload from "../_lib/scores.enc.json" with { type: "json" };

let cache; // survives between requests while the isolate is warm

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function records(env) {
  if (cache) return cache;
  const key = await crypto.subtle.importKey("raw", b64(env.DATA_KEY), "AES-GCM", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(payload.iv) }, key, b64(payload.ct));
  return (cache = JSON.parse(new TextDecoder().decode(plain)));
}

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow",
};
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: HEADERS });

export async function onRequestPost({ request, env }) {
  let id;
  try {
    id = String((await request.json()).id ?? "").trim();
  } catch {
    return reply({ error: "bad_request" }, 400);
  }
  if (!/^\d{8}$/.test(id)) return reply({ error: "invalid_id" }, 400);

  let data;
  try {
    data = await records(env);
  } catch {
    return reply({ error: "server_misconfigured" }, 500);
  }
  const s = Object.hasOwn(data, id) ? data[id] : null;
  if (!s) return reply({ error: "not_found" }, 404);
  return reply({ id, ...s });
}

// Everything else (GET, etc.) is refused so the endpoint can't be browsed or listed.
export const onRequest = () => reply({ error: "method_not_allowed" }, 405);
