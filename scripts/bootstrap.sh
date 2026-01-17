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

This script installs базовые зависимости для презентационного запуска:
- git, curl
- Node.js 20 (через репозиторий NodeSource)
- Docker Engine + docker compose plugin

Требуются права sudo.
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
      echo "Неизвестный аргумент: $arg" >&2
      print_usage
      exit 1
      ;;
  esac
  shift || true
 done

require_sudo() {
  if ! command -v sudo >/dev/null 2>&1; then
    echo "sudo не найден. Установите sudo и повторите." >&2
    exit 1
  fi
}

ensure_command() {
  local cmd="$1"
  local pkg="$2"

  if command -v "$cmd" >/dev/null 2>&1; then
    echo "✓ $cmd уже установлен"
    return
  fi

  echo "→ Устанавливаю $pkg"
  sudo apt-get install -y "$pkg"
}

install_nodesource() {
  if command -v node >/dev/null 2>&1; then
    echo "✓ Node.js уже установлен"
    return
  fi

  echo "→ Добавляю репозиторий NodeSource"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    echo "✓ Docker уже установлен"
    return
  fi

  echo "→ Устанавливаю Docker Engine"
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
    echo "→ Добавляю пользователя $USER в группу docker (потребуется перелогин)"
    sudo usermod -aG docker "$USER"
  fi
}

main() {
  if [[ "${EUID}" -eq 0 ]]; then
    echo "Скрипт не должен запускаться от root. Используйте обычного пользователя с sudo." >&2
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

  echo "Готово. Проверьте версии: node -v, npm -v, docker --version"
}

main
