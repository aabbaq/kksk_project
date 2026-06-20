#!/usr/bin/env bash
# First-time server setup (Ubuntu 22.04+ with Docker).
# Run as root or with sudo:
#   DEPLOY_PATH=/opt/myapp HTTP_PORT=80 bash docker/scripts/server-init.sh
#
# All values are configurable via environment variables (see docs/DEPLOY.md).

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/app}"
HTTP_PORT="${HTTP_PORT:-80}"
HTTPS_PORT="${HTTPS_PORT:-443}"

echo "==> Creating deploy directory: $DEPLOY_PATH"
mkdir -p "$DEPLOY_PATH/docker" "$DEPLOY_PATH/certs"

echo "==> Ensuring Docker Compose plugin is available"
docker compose version

echo "==> Opening HTTP/HTTPS ports (ufw, if enabled)"
if command -v ufw &>/dev/null && ufw status | grep -q 'Status: active'; then
  ufw allow "${HTTP_PORT}/tcp"
  ufw allow "${HTTPS_PORT}/tcp"
  echo "    ufw: allowed ${HTTP_PORT}/tcp and ${HTTPS_PORT}/tcp"
fi

echo ""
echo "==> Next steps (manual):"
echo "  1. Configure GitHub Actions secrets and variables (see docs/DEPLOY.md)"
echo "  2. Copy env template:"
echo "       cp $DEPLOY_PATH/docker/deploy.env.example $DEPLOY_PATH/docker/.env"
echo "  3. Edit secrets:"
echo "       nano $DEPLOY_PATH/docker/.env"
echo "       # Set JWT_SECRET, IMAGE_REGISTRY"
echo "  4. Set GitHub variables DEPLOY_ENABLED=true and CORS_ORIGIN=https://your-domain"
echo "  5. Upload TLS certs before first HTTPS deploy (see docs/DEPLOY.md):"
echo "       $DEPLOY_PATH/certs/fullchain.pem"
echo "       $DEPLOY_PATH/certs/privkey.pem"
echo "  6. Push to master to trigger CI deploy"
echo ""
echo "Done."
