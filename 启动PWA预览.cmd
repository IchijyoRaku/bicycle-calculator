@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js，请先安装 Node.js 18+ 后再运行此脚本。
  pause
  exit /b 1
)

set "PORT=4173"
if not "%1"=="" set "PORT=%1"

echo.
echo 正在启动 PWA 预览服务...
echo 项目目录: %cd%
echo 端口: %PORT%
echo.

start "" http://127.0.0.1:4173
node "%~dp0pwa-preview-server.js"

endlocal
