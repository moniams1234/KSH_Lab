$ErrorActionPreference = "Stop"
$env:PORT = "5173"
Set-Location -LiteralPath $PSScriptRoot
& "C:\Program Files\nodejs\node.exe" ".\.codex-static-server.cjs"
