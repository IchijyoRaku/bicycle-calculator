const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4173);
const rootDir = __dirname;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getMimeType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function safeResolve(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const normalizedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const resolvedPath = path.resolve(rootDir, `.${normalizedPath}`);
  if (!resolvedPath.startsWith(rootDir)) {
    return null;
  }
  return resolvedPath;
}

function sendFile(filePath, res) {
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }

    res.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Type": getMimeType(filePath),
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  Object.values(interfaces).forEach((items) => {
    (items || []).forEach((item) => {
      if (item.family === "IPv4" && !item.internal) {
        addresses.push(item.address);
      }
    });
  });

  return addresses;
}

const server = http.createServer((req, res) => {
  const resolvedPath = safeResolve(req.url || "/");
  if (!resolvedPath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(resolvedPath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      sendFile(path.join(resolvedPath, "index.html"), res);
      return;
    }

    if (!error && stats.isFile()) {
      sendFile(resolvedPath, res);
      return;
    }

    sendFile(path.join(rootDir, "index.html"), res);
  });
});

server.listen(port, host, () => {
  console.log("");
  console.log("PWA 预览服务已启动");
  console.log(`本机访问: http://127.0.0.1:${port}`);

  const lanAddresses = getLanAddresses();
  if (lanAddresses.length > 0) {
    lanAddresses.forEach((address) => {
      console.log(`手机访问: http://${address}:${port}`);
    });
  } else {
    console.log("未检测到可用局域网地址，请确认电脑已连接网络。");
  }

  console.log("");
  console.log("使用说明:");
  console.log("1. 保持此窗口开启");
  console.log("2. 电脑和手机连接同一局域网");
  console.log("3. 手机浏览器打开上面的手机访问地址");
  console.log("4. 在 Chrome 中选择“添加到主屏幕”");
  console.log("5. 按 Ctrl+C 停止服务");
  console.log("");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`端口 ${port} 已被占用，请关闭占用程序后重试。`);
  } else {
    console.error("启动失败:", error.message);
  }
  process.exit(1);
});

