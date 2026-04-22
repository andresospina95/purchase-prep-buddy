import { createServer } from "node:http";
import { Readable } from "node:stream";
import { createReadStream, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import app from "./dist/server/server.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Tipos MIME para assets estáticos
const mimeTypes = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json",
};

function toWebRequest(req) {
  const protocolHeader = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(protocolHeader)
    ? protocolHeader[0]
    : protocolHeader?.split(",")[0] ?? "http";
  const hostname = req.headers.host ?? `${host}:${port}`;
  const url = new URL(req.url ?? "/", `${protocol}://${hostname}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const method = req.method ?? "GET";
  const body = method === "GET" || method === "HEAD" ? undefined : Readable.toWeb(req);

  return new Request(url, { method, headers, body, duplex: "half" });
}

async function writeWebResponse(res, response) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  const setCookies = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [];

  for (const [key, value] of response.headers.entries()) {
    if (key === "set-cookie") continue;
    res.setHeader(key, value);
  }

  if (setCookies.length > 0) res.setHeader("set-cookie", setCookies);
  if (!response.body) { res.end(); return; }

  Readable.fromWeb(response.body).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    const url = req.url ?? "/";

    // ← Servir archivos estáticos desde dist/client
    const staticPath = join(__dirname, "dist", "client", url.split("?")[0]);
    if (existsSync(staticPath) && extname(staticPath)) {
      const mime = mimeTypes[extname(staticPath)] ?? "application/octet-stream";
      res.setHeader("content-type", mime);
      res.setHeader("cache-control", "public, max-age=31536000, immutable");
      createReadStream(staticPath).pipe(res);
      return;
    }

    // Todo lo demás va al handler de TanStack
    const response = await app.fetch(toWebRequest(req));
    await writeWebResponse(res, response);
  } catch (error) {
    console.error("Error iniciando solicitud", error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Servidor listo en http://${host}:${port}`);
});