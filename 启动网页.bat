@echo off
chcp 65001 >nul
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo 未找到 npm，请先安装 Node.js。
  pause
  exit /b 1
)

if not exist node_modules (
  echo 首次运行，正在安装依赖……
  call npm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

echo 网页将在浏览器中打开。关闭本窗口即可停止服务。
call npm run dev -- --port 4173 --open
