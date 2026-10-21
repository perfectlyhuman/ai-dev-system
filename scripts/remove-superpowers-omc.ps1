# Removes Superpowers and oh-my-claudecode (OMC) from Claude Code config and local plugin caches.
# Keeps vercel@ and supabase@ official plugins enabled.
# After running: restart Cursor and Claude Code. In Cursor, disable/uninstall the
# "oh-my-claudecode" plugin under Settings > Plugins if it still appears.

$ErrorActionPreference = 'Stop'
$removed = @()
$skipped = @()
$warnings = @()

function Remove-TreeIfExists([string]$Path) {
  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Recurse -Force
    $script:removed += $Path
  } else {
    $script:skipped += $Path
  }
}

$settingsPath = Join-Path $env:USERPROFILE '.claude\settings.json'
if (Test-Path -LiteralPath $settingsPath) {
  $backup = "$settingsPath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $settingsPath -Destination $backup -Force
  $settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json

  if ($settings.enabledPlugins) {
    $settings.enabledPlugins.PSObject.Properties |
      Where-Object { $_.Name -match 'superpowers|oh-my-claudecode' } |
      ForEach-Object {
        $settings.enabledPlugins.PSObject.Properties.Remove($_.Name)
      }
  }

  if ($settings.extraKnownMarketplaces) {
    @('superpowers-marketplace', 'omc') | ForEach-Object {
      if ($settings.extraKnownMarketplaces.PSObject.Properties.Name -contains $_) {
        $settings.extraKnownMarketplaces.PSObject.Properties.Remove($_)
      }
    }
  }

  [System.IO.File]::WriteAllText($settingsPath, ($settings | ConvertTo-Json -Depth 20) + "`n")
  $removed += "Updated $settingsPath (backup: $backup)"
} else {
  $warnings += "No Claude settings at $settingsPath"
}

# Plugin caches and marketplaces
Remove-TreeIfExists (Join-Path $env:USERPROFILE '.claude\plugins\cache\claude-plugins-official\superpowers')
Remove-TreeIfExists (Join-Path $env:USERPROFILE '.claude\plugins\cache\omc')
Remove-TreeIfExists (Join-Path $env:USERPROFILE '.claude\plugins\marketplaces\omc')
Remove-TreeIfExists (Join-Path $env:USERPROFILE '.claude\plugins\marketplaces\superpowers-marketplace')

$installedPlugins = Join-Path $env:USERPROFILE '.claude\plugins\installed_plugins.json'
$knownMarketplaces = Join-Path $env:USERPROFILE '.claude\plugins\known_marketplaces.json'
if (Test-Path -LiteralPath $installedPlugins) {
  node -e "
const fs=require('fs');
const p=process.argv[1];
const data=JSON.parse(fs.readFileSync(p,'utf8'));
for (const k of Object.keys(data.plugins||{})) {
  if (/superpowers|oh-my-claudecode/.test(k)) delete data.plugins[k];
}
fs.writeFileSync(p, JSON.stringify(data,null,2)+'\n');
" $installedPlugins
  if ($LASTEXITCODE -eq 0) { $script:removed += "Cleaned $installedPlugins" }
}
if (Test-Path -LiteralPath $knownMarketplaces) {
  node -e "
const fs=require('fs');
const p=process.argv[1];
const data=JSON.parse(fs.readFileSync(p,'utf8'));
for (const k of ['superpowers-marketplace','omc']) delete data[k];
fs.writeFileSync(p, JSON.stringify(data,null,2)+'\n');
" $knownMarketplaces
  if ($LASTEXITCODE -eq 0) { $script:removed += "Cleaned $knownMarketplaces" }
}

# Optional home-level state dirs (often gitignored in projects)
Remove-TreeIfExists (Join-Path $env:USERPROFILE '.superpowers')
Remove-TreeIfExists (Join-Path $env:USERPROFILE 'perfectlyhuman\.omc')
Remove-TreeIfExists (Join-Path $env:USERPROFILE 'perfectlyhuman\.omc.bak')

# Strip superpowers override line from global CLAUDE.md if present
$claudeMd = Join-Path $env:USERPROFILE '.claude\CLAUDE.md'
if (Test-Path -LiteralPath $claudeMd) {
  $text = Get-Content -LiteralPath $claudeMd -Raw
  $newText = $text -replace '(?ms)^- \*\*This OVERRIDES the rigor-maximizing default of the process skills\*\*.*\r?\n', ''
  if ($newText -ne $text) {
    $backupMd = "$claudeMd.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -LiteralPath $claudeMd -Destination $backupMd -Force
    [System.IO.File]::WriteAllText($claudeMd, $newText)
    $removed += "Edited $claudeMd (backup: $backupMd)"
  }
}

Write-Host "`n=== Removed / updated ===" -ForegroundColor Green
$removed | ForEach-Object { Write-Host $_ }
Write-Host "`n=== Not found (ok) ===" -ForegroundColor DarkGray
$skipped | ForEach-Object { Write-Host $_ }
if ($warnings.Count) {
  Write-Host "`n=== Warnings ===" -ForegroundColor Yellow
  $warnings | ForEach-Object { Write-Host $_ }
}
Write-Host "`nNext: restart Cursor. If oh-my-claudecode MCP/tools remain, uninstall that plugin in Cursor Settings > Plugins.`n"
