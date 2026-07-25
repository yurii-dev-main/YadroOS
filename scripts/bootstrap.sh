#!/usr/bin/env bash
set -euo pipefail

print_usage() {
  cat <<'USAGE'
Usage: ./scripts/bootstrap.sh [options]

Options:
  --skip-docker       Skip Docker Engine installation
  --skip-node         Skip Node.js 20 installation
  --skip-git          Skip git installation
  --help              Show this help message

This script installs basic dependencies for presentation launch:
- git, curl
- Node.js 20 (via NodeSource repository)
- Docker Engine + docker compose plugin

sudo privileges required.
USAGE
}

skip_docker=false
skip_node=false
skip_git=false

for arg in "$@"; do
  case "$arg" in
    --skip-docker)
      skip_docker=true
      ;;
    --skip-node)
      skip_node=true
      ;;
    --skip-git)
      skip_git=true
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      print_usage
      exit 1
      ;;
  esac
  shift || true
 done

require_sudo() {
  if ! command -v sudo >/dev/null 2>&1; then
    echo "sudo not found. Install sudo and try again." >&2
    exit 1
  fi
}

ensure_command() {
  local cmd="$1"
  local pkg="$2"

  if command -v "$cmd" >/dev/null 2>&1; then
    echo "✓ $cmd is already installed"
    return
  fi

  echo "→ Installing $pkg"
  sudo apt-get install -y "$pkg"
}

install_nodesource() {
  if command -v node >/dev/null 2>&1; then
    echo "✓ Node.js is already installed"
    return
  fi

  echo "→ Adding NodeSource repository"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    echo "✓ Docker is already installed"
    return
  fi

  echo "→ Installing Docker Engine"
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  local codename
  codename="$(. /etc/os-release && echo "$VERSION_CODENAME")"
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${codename} stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  if ! getent group docker >/dev/null; then
    sudo groupadd docker
  fi

  if ! id -nG "$USER" | grep -q "\bdocker\b"; then
    echo "→ Adding user $USER to docker group (re-login required)"
    sudo usermod -aG docker "$USER"
  fi
}

main() {
  if [[ "${EUID}" -eq 0 ]]; then
    echo "Script should not be run as root. Use a regular user with sudo." >&2
    exit 1
  fi

  require_sudo
  sudo apt-get update -y

  if [[ "$skip_git" == false ]]; then
    ensure_command git git
  fi

  ensure_command curl curl

  if [[ "$skip_node" == false ]]; then
    install_nodesource
  fi

  if [[ "$skip_docker" == false ]]; then
    install_docker
  fi

  echo "Done. Check versions: node -v, npm -v, docker --version"
}

main
