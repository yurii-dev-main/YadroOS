# Протокол автоматического запуска БД и фронтенда

Этот протокол описывает запуск локального окружения через единый скрипт, который поднимает нужные базы и backend в Docker, а затем запускает frontend.

## Предусловия
- Docker Engine или Docker Desktop (с поддержкой `docker compose`).
- Node.js 20+ и npm (для запуска фронтенда).

## Состав окружения
- PostgreSQL и backend поднимаются через `docker-compose.yml`.
- Frontend запускается локально через Vite.

## Запуск
1. Из корня репозитория выполните:
   ```bash
   ./scripts/start-local.sh
   ```
2. Скрипт:
   - поднимет сервисы `db` и `backend` через Docker Compose;
   - установит зависимости, если отсутствует `node_modules`;
   - запустит фронтенд командой `npm run dev`.

## Ожидаемые адреса
- Frontend (Vite): http://localhost:5187
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

## Остановка
- Остановить frontend: `Ctrl+C` в терминале, где запущен скрипт.
- Остановить контейнеры:
  ```bash
  docker compose down
  ```

## Диагностика
- Статус контейнеров:
  ```bash
  docker compose ps
  ```
- Логи backend:
  ```bash
  docker compose logs -f backend
  ```
