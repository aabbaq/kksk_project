#!/usr/bin/env bash
# Reload nginx after replacing TLS certificate files (no full stack restart).
#
# Example:
#   DEPLOY_PATH=/opt/app bash docker/scripts/reload-nginx.sh

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/app}"
COMPOSE_FILE="${COMPOSE_FILE:-docker/docker-compose.prod.yml}"
CERT_DIR="${CERT_DIR:-$DEPLOY_PATH/certs}"

cd "$DEPLOY_PATH"

for file in fullchain.pem privkey.pem; do
  if [ ! -f "$CERT_DIR/$file" ]; then
    echo "ERROR: missing certificate file: $CERT_DIR/$file" >&2
    exit 1
  fi
done

docker compose -f "$COMPOSE_FILE" exec -T nginx nginx -t
docker compose -f "$COMPOSE_FILE" exec -T nginx nginx -s reload

echo "nginx reloaded. Certificate files:"
ls -la "$CERT_DIR"/fullchain.pem "$CERT_DIR"/privkey.pem
