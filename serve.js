/* Simple local dev server for the portfolio.
   Serves static files and supports video range requests (so MP4s
   stream/seek correctly).

   Run it with:   node serve.js
   Then open:     http://localhost:8000
*/
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  try {
    let rel = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
    if (rel === "/") rel = "/index.html";

    // prevent path traversal outside the project
    const fp = path.normalize(path.join(ROOT, rel));
    if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end("403"); }

    if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    const stat = fs.statSync(fp);
    const type = TYPES[path.extname(fp).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range;

    // Range request (video seeking). Guard against empty files / bad ranges.
    if (range && type.startsWith("video") && stat.size > 0) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= stat.size) end = stat.size - 1;
      if (start > end) { start = 0; end = stat.size - 1; }

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": type,
      });
      return fs.createReadStream(fp, { start, end }).pipe(res);
    }

    res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size });
    fs.createReadStream(fp).pipe(res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Server Error");
  }
}).listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
