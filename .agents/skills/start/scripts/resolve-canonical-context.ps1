[CmdletBinding()]
param(
  [Parameter()]
  [string]$RepositoryRoot = (Get-Location).Path,

  [Parameter()]
  [switch]$SkipFetch
)

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$contractPath = Join-Path $root '.ai-dev/project.yaml'

if (-not (Test-Path -LiteralPath $contractPath -PathType Leaf)) {
  throw "Missing project contract: $contractPath"
}

& git -C $root rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
  throw "Not a Git worktree: $root"
}

$contract = Get-Content -LiteralPath $contractPath -Raw

function Read-ContractValue {
  param(
    [Parameter(Mandatory)]
    [string]$Key
  )

  $pattern = '(?m)^\s*' + [regex]::Escape($Key) + ':\s*["'']?([^"''\s#]+)'
  $match = [regex]::Match($contract, $pattern)

  if (-not $match.Success) {
    throw "Missing '$Key' in $contractPath"
  }

  return $match.Groups[1].Value
}

function Resolve-Commit {
  param(
    [Parameter(Mandatory)]
    [string]$Ref
  )

  $value = & git -C $root rev-parse --verify "$Ref^{commit}" 2> $null
  if ($LASTEXITCODE -ne 0) {
    return $null
  }

  return ($value | Select-Object -First 1).Trim()
}

function Test-GitPath {
  param(
    [Parameter(Mandatory)]
    [string]$Commit,

    [Parameter(Mandatory)]
    [string]$Path
  )

  & git -C $root cat-file -e "${Commit}:$Path" 2> $null
  return $LASTEXITCODE -eq 0
}

function Compare-Commits {
  param(
    [Parameter(Mandatory)]
    [string]$Left,

    [Parameter(Mandatory)]
    [string]$Right
  )

  $counts = (& git -C $root rev-list --left-right --count "$Left...$Right").Trim() -split '\s+'
  if ($LASTEXITCODE -ne 0 -or $counts.Count -ne 2) {
    throw "Unable to compare commits $Left and $Right"
  }

  return [ordered]@{
    left_only = [int]$counts[0]
    right_only = [int]$counts[1]
  }
}

$mainBranch = Read-ContractValue -Key 'main_branch'
$projectPath = Read-ContractValue -Key 'project'
$roadmapPath = Read-ContractValue -Key 'roadmap'
$remoteNames = @(& git -C $root remote)
$hasOrigin = $remoteNames -contains 'origin'
$fetchAttempted = $false
$fetchSucceeded = $false
$fetchError = $null

if ($hasOrigin -and -not $SkipFetch) {
  $fetchAttempted = $true
  $previousPrompt = $env:GIT_TERMINAL_PROMPT

  try {
    $env:GIT_TERMINAL_PROMPT = '0'
    & git -C $root fetch --quiet origin $mainBranch *> $null
    $fetchSucceeded = $LASTEXITCODE -eq 0

    if (-not $fetchSucceeded) {
      $fetchError = "git fetch origin $mainBranch failed with exit code $LASTEXITCODE"
    }
  }
  finally {
    $env:GIT_TERMINAL_PROMPT = $previousPrompt
  }
}

$remoteMainRef = "refs/remotes/origin/$mainBranch"
$localMainRef = "refs/heads/$mainBranch"
$remoteMainSha = if ($hasOrigin) { Resolve-Commit -Ref $remoteMainRef } else { $null }
$localMainSha = Resolve-Commit -Ref $localMainRef

if ($remoteMainSha) {
  $canonicalRef = "origin/$mainBranch"
  $canonicalSha = $remoteMainSha
}
elseif ($localMainSha) {
  $canonicalRef = $mainBranch
  $canonicalSha = $localMainSha
}
else {
  throw "Neither origin/$mainBranch nor local $mainBranch resolves to a commit"
}

$headSha = Resolve-Commit -Ref 'HEAD'
$currentBranch = (& git -C $root symbolic-ref --quiet --short HEAD 2> $null)
if ($LASTEXITCODE -ne 0 -or -not $currentBranch) {
  $currentBranch = '(detached)'
}
else {
  $currentBranch = $currentBranch.Trim()
}

$workingTreeEntries = @(& git -C $root status --porcelain=v1 -uall)
$workingTreeDocChanges = @(
  & git -C $root status --porcelain=v1 -- $projectPath $roadmapPath
)
$headComparison = Compare-Commits -Left $canonicalSha -Right $headSha
$mainComparison = if ($remoteMainSha -and $localMainSha) {
  Compare-Commits -Left $remoteMainSha -Right $localMainSha
}
else {
  $null
}

$result = [ordered]@{
  schema_version = 1
  repository_root = $root
  main_branch = $mainBranch
  fetch_attempted = $fetchAttempted
  fetch_succeeded = $fetchSucceeded
  fetch_error = $fetchError
  canonical_ref = $canonicalRef
  canonical_sha = $canonicalSha
  canonical_project_path = $projectPath
  canonical_roadmap_path = $roadmapPath
  canonical_project_exists = Test-GitPath -Commit $canonicalSha -Path $projectPath
  canonical_roadmap_exists = Test-GitPath -Commit $canonicalSha -Path $roadmapPath
  current_branch = $currentBranch
  current_head_sha = $headSha
  canonical_only_commits_vs_head = $headComparison.left_only
  current_only_commits_vs_canonical = $headComparison.right_only
  working_tree_dirty = $workingTreeEntries.Count -gt 0
  working_tree_entry_count = $workingTreeEntries.Count
  working_tree_documentation_changes = $workingTreeDocChanges
  local_main_sha = $localMainSha
  remote_main_sha = $remoteMainSha
  remote_main_only_commits_vs_local_main = if ($mainComparison) { $mainComparison.left_only } else { $null }
  local_main_only_commits_vs_remote_main = if ($mainComparison) { $mainComparison.right_only } else { $null }
}

$result | ConvertTo-Json -Depth 4
