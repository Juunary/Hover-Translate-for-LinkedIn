# Regenerates the 1280x800 store screenshots into ../store-assets.
# Usage: powershell -ExecutionPolicy Bypass -File tools\capture.ps1

$ErrorActionPreference = 'Stop'

$tools = $PSScriptRoot
$root = Split-Path $tools -Parent
$outDir = Join-Path $root 'store-assets'

$chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) { throw 'chrome.exe not found' }
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# popup.html rendered inside an iframe needs a chrome.storage stub, so build a
# throwaway copy from the real popup so the two never drift apart.
$stub = @'
    <script>
      window.chrome = {
        storage: {
          sync: {
            _v: { enabled: true, target: 'ko', delay: 200, maxChars: 600 },
            get(d, cb) { cb(Object.assign({}, d, this._v)); },
            set(o) { Object.assign(this._v, o); }
          },
          onChanged: { addListener() {} }
        }
      };
    </script>
'@
$popup = Get-Content (Join-Path $root 'popup.html') -Raw -Encoding UTF8
$popup = $popup -replace '(?=    <script src="langs\.js">)', ($stub + "`r`n")
$popup = $popup -replace 'src="langs\.js"', 'src="../langs.js"'
$popup = $popup -replace 'src="popup\.js"', 'src="../popup.js"'
$popup | Out-File (Join-Path $tools 'popup-demo.html') -Encoding utf8

$profile = Join-Path $env:TEMP 'lht-shot-profile'
$page = 'file:///' + ((Join-Path $tools 'screenshot-page.html') -replace '\\', '/')

# Chrome writes progress to stderr; in Windows PowerShell that surfaces as an
# ErrorRecord and would trip $ErrorActionPreference = 'Stop'.
$prevEap = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
foreach ($n in 1, 2, 3) {
  $out = Join-Path $outDir "screenshot-$n.png"
  if (Test-Path $out) { Remove-Item $out -Force }
  $url = $page + '?n=' + $n
  & $chrome --headless=new --disable-gpu --hide-scrollbars --no-first-run `
    --user-data-dir=$profile --allow-file-access-from-files `
    --window-size=1280,800 --virtual-time-budget=8000 `
    --screenshot=$out $url | Out-Null
}
$ErrorActionPreference = $prevEap

foreach ($n in 1, 2, 3) {
  if (-not (Test-Path (Join-Path $outDir "screenshot-$n.png"))) { throw "capture failed for shot $n" }
}

Add-Type -AssemblyName System.Drawing
foreach ($n in 1, 2, 3) {
  $p = Join-Path $outDir "screenshot-$n.png"
  $img = [System.Drawing.Image]::FromFile($p)
  Write-Output "screenshot-$n.png  $($img.Width)x$($img.Height)"
  $img.Dispose()
}
