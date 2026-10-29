# Removes the retired agent runtimes (Superpowers and oh-my-claudecode / OMC) from this machine.
#
# Sweeps: Claude and Codex plugin caches and registries, machine-level state directories, and
# per-project leftovers (.omc/, .superpowers/, omc.bak) under the roots you pass with -Root.
#
# It never deletes a git-tracked path. Anything tracked is reported instead, because removing it
# belongs in that repository's own commit rather than in a machine-cleanup run.
#
# After running: restart Claude Code, Cursor, and Codex. If a plugin still appears in a UI, remove
# it there; the caches are gone but the product may cache its own listing.

[CmdletBinding()]
param(
  [string[]] $Root = @((Join-Path $HOME 'perfectlyhuman'), (Join-Path $HOME 'OneDrive\Documents')),
  [int] $Depth = 6,
  [switch] $DryRun
)

$ErrorActionPreference = 'Stop'
$stateLeaves = @('.omc', '.superpowers', 'omc.bak')
$retiredPattern = 'superpowers|oh-my-claudecode|(^|[\\/])omc([\\/]|$|\.)'
$removed = [System.Collections.Generic.List[string]]::new()
$skipped = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$freed = 0

function Get-TreeBytes([string] $Path) {
  if (Test-Path -LiteralPath $Path -PathType Leaf) { return (Get-Item -LiteralPath $Path).Length }
  $sum = (Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue |
    Measure-Object Length -Sum).Sum
  if ($sum) { return $sum }
  return 0
}

function Find-RepoRoot([string] $Path) {
  $cur = Split-Path -Parent $Path
  while ($cur) {
    if (Test-Path -LiteralPath (Join-Path $cur '.git')) { return $cur }
    $cur = Split-Path -Parent $cur
  }
  return $null
}

function Test-GitTracked([string] $Path) {
  $repo = Find-RepoRoot $Path
  if (-not $repo) { return $false }
  $rel = $Path.Substring($repo.Length + 1).Replace('\', '/')
  $hits = git -C $repo ls-files -- $rel 2>$null
  return [bool]($hits | Where-Object { $_ })
}

function Remove-RetiredPath([string] $Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  if (Test-GitTracked $Path) {
    $script:skipped.Add("$Path (git-tracked: remove it in that repository's commit)")
    return
  }
  $bytes = Get-TreeBytes $Path
  if ($DryRun) {
    $script:removed.Add("[dry run] $Path")
    $script:freed += $bytes
    return
  }
  Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue
  if (Test-Path -LiteralPath $Path) {
    $script:skipped.Add("$Path (delete failed: in use?)")
    return
  }
  $script:removed.Add($Path)
  $script:freed += $bytes
}

# --- Claude Code plugin caches, marketplaces, and registries -------------------------------------

$claudeRoot = Join-Path $HOME '.claude'
foreach ($sub in @('plugins\cache', 'plugins\data', 'plugins\marketplaces')) {
  $dir = Join-Path $claudeRoot $sub
  if (-not (Test-Path -LiteralPath $dir)) { continue }
  Get-ChildItem -LiteralPath $dir -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match $retiredPattern } |
    ForEach-Object { Remove-RetiredPath $_.FullName }
}

$claudeSettings = Join-Path $claudeRoot 'settings.json'
if (Test-Path -LiteralPath $claudeSettings) {
  $settings = Get-Content -LiteralPath $claudeSettings -Raw | ConvertFrom-Json
  $changed = $false
  foreach ($group in @('enabledPlugins', 'extraKnownMarketplaces')) {
    if (-not $settings.$group) { continue }
    foreach ($name in @($settings.$group.PSObject.Properties.Name)) {
      if ($name -match $retiredPattern) {
        $settings.$group.PSObject.Properties.Remove($name)
        $changed = $true
        $removed.Add("$claudeSettings : $group/$name")
      }
    }
  }
  if ($changed -and -not $DryRun) {
    $backup = "$claudeSettings.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -LiteralPath $claudeSettings -Destination $backup -Force
    [System.IO.File]::WriteAllText($claudeSettings, ($settings | ConvertTo-Json -Depth 20) + "`n")
    $warnings.Add("Backed up $claudeSettings to $backup")
  }
}

foreach ($registry in @('installed_plugins.json', 'known_marketplaces.json')) {
  $path = Join-Path $claudeRoot "plugins\$registry"
  if (-not (Test-Path -LiteralPath $path)) { continue }
  if ((Select-String -LiteralPath $path -Pattern $retiredPattern -Quiet -ErrorAction SilentlyContinue)) {
    $warnings.Add("$path still mentions a retired runtime; revisit by hand before deleting entries")
  }
}

# --- Codex plugin caches and temp plugin trees --------------------------------------------------

$codexRoot = Join-Path $HOME '.codex'
foreach ($sub in @('plugins\cache', 'plugins\data', '.tmp\plugins')) {
  $dir = Join-Path $codexRoot $sub
  if (-not (Test-Path -LiteralPath $dir)) { continue }
  Get-ChildItem -LiteralPath $dir -Recurse -Depth 4 -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match $retiredPattern } |
    Sort-Object { $_.FullName.Length } -Descending |
    ForEach-Object { Remove-RetiredPath $_.FullName }
}

# --- Machine-level state ------------------------------------------------------------------------

foreach ($path in @((Join-Path $HOME '.superpowers'), (Join-Path $HOME '.omc'))) {
  Remove-RetiredPath $path
}

# --- Project leftovers --------------------------------------------------------------------------

$scanned = 0
foreach ($root in $Root) {
  if (-not (Test-Path -LiteralPath $root)) { continue }
  Get-ChildItem -LiteralPath $root -Directory -Force -Recurse -Depth $Depth -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $stateLeaves -contains $_.Name } |
    Sort-Object { $_.FullName.Length } -Descending |
    ForEach-Object { $scanned++; Remove-RetiredPath $_.FullName }
}

# Agent memory files that would otherwise keep re-injecting the retired guidance.
foreach ($memoryRoot in @((Join-Path $claudeRoot 'projects'))) {
  if (-not (Test-Path -LiteralPath $memoryRoot)) { continue }
  Get-ChildItem -LiteralPath $memoryRoot -Recurse -Depth 3 -File -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.DirectoryName -match '\\memory$' -and $_.Name -match $retiredPattern } |
    ForEach-Object { Remove-RetiredPath $_.FullName }
}

# --- Report -------------------------------------------------------------------------------------

Write-Host "`n=== Removed ($($removed.Count)) ===" -ForegroundColor Green
$removed | ForEach-Object { Write-Host "  $_" }
Write-Host "`n=== Skipped ($($skipped.Count)) ===" -ForegroundColor Yellow
$skipped | ForEach-Object { Write-Host "  $_" }
if ($warnings.Count) {
  Write-Host "`n=== Warnings ===" -ForegroundColor Yellow
  $warnings | ForEach-Object { Write-Host "  $_" }
}
Write-Host ("`nFreed {0:N1} KB across {1} project state directories scanned.`n" -f ($freed / 1kb), $scanned)
Write-Host "Next: restart Claude Code, Cursor, and Codex, then remove any plugin that still appears in a UI.`n"
