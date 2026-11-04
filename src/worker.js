// Cloudflare Workers entry: /api/score -> score lookup, everything else -> static files in ./public
import { onRequestPost, onRequest } from "../functions/api/score.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/score") {
      return request.method === "POST" ? onRequestPost({ request, env }) : onRequest();
    }
    return env.ASSETS.fetch(request);
  },
};
