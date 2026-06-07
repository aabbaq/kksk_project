#!/usr/bin/env bash
# Remote deploy script — run on the server by GitHub Actions or manually.
# All paths and image registry are configurable via environment variables.
#
# Example (manual):
#   export DEPLOY_PATH=/opt/myapp
#   export IMAGE_REGISTRY=ghcr.io/owner/repo
#   export IMAGE_TAG=latest
#   bash docker/scripts/deploy-remote.sh

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/app}"
COMPOSE_FILE="${COMPOSE_FILE:-docker/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env}"
ENV_TEMPLATE="${ENV_TEMPLATE:-docker/deploy.env.example}"
IMAGE_REGISTRY="${IMAGE_REGISTRY:?IMAGE_REGISTRY is required}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
GHCR_USER="${GHCR_USER:-}"
GHCR_TOKEN="${GHCR_TOKEN:-}"

cd "$DEPLOY_PATH"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: compose file not found: $DEPLOY_PATH/$COMPOSE_FILE" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  if [ ! -f "$ENV_TEMPLATE" ]; then
    echo "ERROR: neither $ENV_FILE nor $ENV_TEMPLATE exists under $DEPLOY_PATH" >&2
    exit 1
  fi
  cp "$ENV_TEMPLATE" "$ENV_FILE"
  echo "WARN: $ENV_FILE created from template — edit JWT_SECRET and CORS_ORIGIN on the server!"
fi

update_env_var() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
}

update_env_var IMAGE_REGISTRY "$IMAGE_REGISTRY"
update_env_var IMAGE_TAG "$IMAGE_TAG"

if [ -n "$GHCR_TOKEN" ] && [ -n "$GHCR_USER" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
elif [ -n "$GHCR_TOKEN" ]; then
  echo "WARN: GHCR_USER not set — skipping docker login"
else
  echo "INFO: GHCR_TOKEN not set — assuming public GHCR packages"
fi

# --env-file: compose file lives under docker/, but .env lives in DEPLOY_PATH root
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans
docker image prune -f

echo "Deploy complete. Running containers:"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
