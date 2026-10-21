// Relais : novapolis.pages.dev/api/xxx est transmis à l'API sur Render.
// Le navigateur ne parle qu'au site, donc les bloqueurs de pub ne bloquent plus rien.
const API = 'https://novapolis-resilience.onrender.com';

export async function onRequest({ request, params }) {
    const chemin = (params.chemin ?? []).join('/');
    const url = new URL(request.url);
    const cible = `${API}/${chemin}${url.search}`;
    return fetch(cible, {
        method: request.method,
        headers: { 'Content-Type': request.headers.get('Content-Type') ?? 'application/json' },
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    });
}