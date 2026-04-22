import { createServer } from "node:http";
import { Readable } from "node:stream";
import app from "./dist/server/server.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

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

  return new Request(url, {
    method,
    headers,
    body,
    duplex: "half",
  });
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

  if (setCookies.length > 0) {
    res.setHeader("set-cookie", setCookies);
  }

  if (!response.body) {
    res.end();
    return;
  }

  Readable.fromWeb(response.body).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
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