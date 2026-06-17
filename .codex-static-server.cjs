const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Number(process.env.PORT || 5500);
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};

function encodeKrsToken(krs, timestamp) {
  const krsPositions = [193, 8, 327, 501, 112, 74, 409, 226, 16, 306];
  const timestampPositions = [492, 141, 364, 78, 259, 12, 430, 384, 97, 503, 67, 35, 471, 218];
  const checksumPositions = [24, 46, 174, 345];
  const shiftMarkerPosition = 11;
  const digits = String(krs || "0000000000").padStart(10, "0").slice(-10);
  const date = new Date(timestamp);
  const two = value => String(value).padStart(2, "0");
  const stamp = String(date.getFullYear()) + two(date.getMonth() + 1) + two(date.getDate()) + two(date.getHours()) + two(date.getMinutes()) + two(date.getSeconds());
  const token = Array.from({ length: 512 }, () => String(Math.floor(Math.random() * 10)));

  for (let index = 508; index < 512; index++) token[index] = "0";
  krsPositions.forEach((position, index) => token[position] = digits[index]);
  timestampPositions.forEach((position, index) => token[position] = stamp[index]);

  const shift = Math.floor(Math.random() * 9) + 1;
  token[shiftMarkerPosition] = String(shift);

  checksumPositions.forEach(position => {
    for (let index = token.length - 1; index > position; index--) token[index] = token[index - 1];
    token[position] = "0";
  });

  const checksum = token.reduce((sum, value) => sum + Number(value), 0).toString().padStart(4, "0");
  checksumPositions.forEach((position, index) => token[position] = checksum[index]);

  const copy = [...token];
  for (let index = 0; index < copy.length; index++) token[(index + shift) % copy.length] = copy[index];
  return token.join("");
}

function utcTimestamp() {
  const date = new Date();
  const two = value => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${two(date.getUTCMonth() + 1)}-${two(date.getUTCDate())}T${two(date.getUTCHours())}:${two(date.getUTCMinutes())}:${two(date.getUTCSeconds())}`;
}

function proxySearchApi(req, res) {
  const chunks = [];
  req.on("data", chunk => chunks.push(chunk));
  req.on("end", () => {
    const body = Buffer.concat(chunks).toString("utf8") || "{}";
    let krs = "0000000000";
    try {
      const parsed = JSON.parse(body);
      if (parsed?.krs && /^\d+$/.test(parsed.krs)) krs = parsed.krs;
      if (parsed?.podmiot?.krs && /^\d+$/.test(parsed.podmiot.krs)) krs = parsed.podmiot.krs;
    } catch {
      // Keep default KRS token seed for malformed payloads; upstream will validate body.
    }

    const upstreamPath = req.url.replace(/^\/api\/search-krs/, "/api");
    const request = https.request({
      hostname: "wyszukiwarka-krs-api.ms.gov.pl",
      path: upstreamPath,
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "x-api-key": "TopSecretApiKey",
        "apiKey": encodeKrsToken(krs, utcTimestamp())
      }
    }, upstreamRes => {
      res.writeHead(upstreamRes.statusCode || 502, {
        "Content-Type": upstreamRes.headers["content-type"] || "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      });
      upstreamRes.pipe(res);
    });

    request.on("error", error => {
      res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: error.message }));
    });
    request.end(body);
  });
}

http.createServer((req, res) => {
  if (req.url.startsWith("/api/search-krs/")) {
    proxySearchApi(req, res);
    return;
  }

  if (req.url.startsWith("/api/krs/")) {
    const upstreamPath = req.url.replace(/^\/api\/krs/, "/api/krs");
    const upstream = {
      hostname: "api-krs.ms.gov.pl",
      path: upstreamPath,
      method: "GET",
      headers: { "Accept": "application/json" }
    };

    https.request(upstream, upstreamRes => {
      const headers = {
        "Content-Type": upstreamRes.headers["content-type"] || "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      };
      res.writeHead(upstreamRes.statusCode || 502, headers);
      upstreamRes.pipe(res);
    }).on("error", error => {
      res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: error.message }));
    }).end();
    return;
  }

  let requestPath = decodeURIComponent(req.url.split("?")[0]);
  if (requestPath === "/" || requestPath === "") requestPath = "/index.html";

  const normalized = path.normalize(requestPath).replace(/^(\.\.[\\/])+/, "");
  const file = path.join(root, normalized);

  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, host);
