/**
 * Static asset Worker for MedPre-Pack.
 *
 * The app is a client-side SPA, so every request is served from the asset
 * bundle. Unknown paths that look like a page fall back to index.html so a
 * refresh on any URL still loads the app.
 */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    const url = new URL(request.url);
    if (url.pathname.includes('.')) return response;

    const fallbackUrl = new URL('/', url);
    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};
