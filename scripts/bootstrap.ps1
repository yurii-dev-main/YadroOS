Param(
    [switch]$SkipDocker,
    [switch]$SkipNode,
    [switch]$SkipGit,
    [switch]$Help
)

if ($Help) {
    @'
Usage: .\scripts\bootstrap.ps1 [options]

Options:
  -SkipDocker   Skip Docker Desktop installation step (prints link)
  -SkipNode     Skip Node.js installation step
  -SkipGit      Skip git installation step
  -Help         Show this help message

This script installs basic dependencies for presentation launch (Windows):
- git (winget)
- Node.js 20 LTS (winget)
- Docker Desktop (prints download link; optional winget if available)

Administrator privileges are required for installation via winget.
'@ | Write-Output
    exit 0
}

function Ensure-Admin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Error "Run PowerShell as Administrator."
        exit 1
    }
}

function Ensure-Winget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Error "winget not found. Install App Installer from Microsoft Store and try again."
        exit 1
    }
}

function Install-WingetPackage {
    param(
        [string]$Id,
        [string]$Name
    )

    $existing = winget list --id $Id --source winget 2>$null
    if ($existing -and ($existing | Select-String -Pattern $Id)) {
        Write-Output "✓ $Name is already installed"
        return
    }

    Write-Output "→ Installing $Name"
    winget install --id $Id --source winget --accept-package-agreements --accept-source-agreements
}

Ensure-Admin
Ensure-Winget

if (-not $SkipGit) {
    Install-WingetPackage -Id "Git.Git" -Name "git"
}

if (-not $SkipNode) {
    Install-WingetPackage -Id "OpenJS.NodeJS.LTS" -Name "Node.js LTS"
}

if (-not $SkipDocker) {
    $dockerId = "Docker.DockerDesktop"
    $dockerExisting = winget list --id $dockerId --source winget 2>$null
    if ($dockerExisting -and ($dockerExisting | Select-String -Pattern $dockerId)) {
        Write-Output "✓ Docker Desktop is already installed"
    } else {
        Write-Output "→ Installing Docker Desktop via winget"
        winget install --id $dockerId --source winget --accept-package-agreements --accept-source-agreements
        Write-Output "If winget is not available for Docker Desktop, download installer: https://www.docker.com/products/docker-desktop/"
    }
}

Write-Output "Done. Check versions: node -v, npm -v, git --version"
