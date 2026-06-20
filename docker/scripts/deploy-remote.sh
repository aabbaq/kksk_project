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
ENV_FILE="${ENV_FILE:-docker/.env}"
ENV_TEMPLATE="${ENV_TEMPLATE:-docker/deploy.env.example}"
IMAGE_REGISTRY="${IMAGE_REGISTRY:?IMAGE_REGISTRY is required}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
CORS_ORIGIN="${CORS_ORIGIN:-}"
GHCR_USER="${GHCR_USER:-}"
GHCR_TOKEN="${GHCR_TOKEN:-}"

cd "$DEPLOY_PATH"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: compose file not found: $DEPLOY_PATH/$COMPOSE_FILE" >&2
  exit 1
fi

# Migrate legacy .env at deploy root (older docs placed it next to docker/)
if [ -f .env ] && [ ! -f "$ENV_FILE" ]; then
  mv .env "$ENV_FILE"
  echo "INFO: migrated .env -> $ENV_FILE"
fi

if [ ! -f "$ENV_FILE" ]; then
  if [ ! -f "$ENV_TEMPLATE" ]; then
    echo "ERROR: neither $ENV_FILE nor $ENV_TEMPLATE exists under $DEPLOY_PATH" >&2
    exit 1
  fi
  cp "$ENV_TEMPLATE" "$ENV_FILE"
  echo "WARN: $ENV_FILE created from template — edit JWT_SECRET on the server (or set GitHub variable CORS_ORIGIN for CI deploy)!"
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

if [ -n "$CORS_ORIGIN" ]; then
  update_env_var CORS_ORIGIN "$CORS_ORIGIN"
fi

update_env_var_if_set() {
  local key="$1" val="${2:-}"
  if [ -n "$val" ]; then
    update_env_var "$key" "$val"
  fi
}

update_env_var_if_set STORAGE_USE_OBJECT_STORE "${STORAGE_USE_OBJECT_STORE:-}"
update_env_var_if_set OSS_BUCKET "${OSS_BUCKET:-}"
update_env_var_if_set OSS_REGION "${OSS_REGION:-}"
update_env_var_if_set OSS_ENDPOINT "${OSS_ENDPOINT:-}"
update_env_var_if_set OSS_ACCESS_KEY_ID "${OSS_ACCESS_KEY_ID:-}"
update_env_var_if_set OSS_SECRET_ACCESS_KEY "${OSS_SECRET_ACCESS_KEY:-}"
update_env_var_if_set OSS_PUBLIC_BASE_URL "${OSS_PUBLIC_BASE_URL:-}"
update_env_var_if_set OSS_KEY_PREFIX "${OSS_KEY_PREFIX:-}"
update_env_var_if_set OSS_FORCE_PATH_STYLE "${OSS_FORCE_PATH_STYLE:-}"

if [ -n "$GHCR_TOKEN" ] && [ -n "$GHCR_USER" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
elif [ -n "$GHCR_TOKEN" ]; then
  echo "WARN: GHCR_USER not set — skipping docker login"
else
  echo "INFO: GHCR_TOKEN not set — assuming public GHCR packages"
fi

# Pull one service at a time so CI logs show progress (api is the largest layer set).
echo "==> Pulling images (first deploy may take several minutes)..."
for service in mongodb web api nginx; do
  echo "==> Pulling $service..."
  docker compose -f "$COMPOSE_FILE" pull "$service"
done

echo "==> Starting containers..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
docker image prune -f

echo "Deploy complete. Running containers:"
docker compose -f "$COMPOSE_FILE" ps
