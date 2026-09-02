# Builds the Chrome Web Store upload package.
# Usage: powershell -ExecutionPolicy Bypass -File package.ps1

$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
$manifest = Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
$version = $manifest.version

$dist = Join-Path $root 'dist'
$zip = Join-Path $dist "hover-translate-for-linkedin-$version.zip"

if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist -Force | Out-Null }
if (Test-Path $zip) { Remove-Item $zip -Force }

# Runtime files only. Docs, the 512px master, and this script stay out of the package.
$files = @(
  'manifest.json',
  'background.js',
  'content.js',
  'langs.js',
  'popup.html',
  'popup.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png'
)

# Compress-Archive on Windows PowerShell writes backslash separators into the
# archive, which is invalid per the ZIP spec. Build the entries by hand so the
# names use forward slashes.
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($zip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    $src = Join-Path $root ($file -replace '/', '\')
    if (-not (Test-Path $src)) { throw "missing file: $file" }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive, $src, $file, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $archive.Dispose()
}

$kb = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Output "packaged: $zip ($kb KB)"
