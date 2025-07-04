import { GameState } from "../game/GameState";
import { join } from "path";
import { readFileSync } from "fs";

export function createFetch(gameState: GameState) {
  return function fetch(req: Request, server: Bun.Server) {
    const url = new URL(req.url);

    if (url.pathname === '/game-state' && req.method === 'GET') {
      return new Response(JSON.stringify(gameState.serialize()), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/start' && req.method === 'GET') {
      gameState.start();
      return new Response(JSON.stringify(gameState.serialize()), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/stop' && req.method === 'GET') {
      gameState.stop();
      return new Response('ok', {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname.startsWith('/ws')) {
      if (server.upgrade(req, { data: { url } })) return;
      return new Response(null, { status: 426 });
    }

    if (url.pathname === '/game' && req.method === 'GET') {
      // Pliki statyczne
      return handleStaticFile('index.html');
    }

    if (req.method === 'GET') {
      // Pliki statyczne
      return handleStaticFile(url.pathname);
    }

    return new Response('Not Found', { status: 404 });
  }
}

// Serwowanie plików statycznych
async function handleStaticFile(pathname: string): Promise<Response> {
  const path = join(import.meta.dir, "public", pathname);

  try {
    const file = readFileSync(path);
    return new Response(file, {
      headers: { "Content-Type": getContentType(path) }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

// Pomocnicza funkcja do nagłówków Content-Type
function getContentType(path: string): string {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "text/javascript";
  return "text/plain";
}
