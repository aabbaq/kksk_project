#!/usr/bin/env bash
# First-time setup on Alibaba Cloud ECS (Ubuntu 22.04)
# Run as root or with sudo: bash docker/scripts/server-init.sh

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/lothric}"

echo "==> Creating deploy directory: $DEPLOY_PATH"
mkdir -p "$DEPLOY_PATH/docker"

echo "==> Ensuring Docker Compose plugin is available"
docker compose version

echo "==> Opening HTTP port (ufw, if enabled)"
if command -v ufw &>/dev/null && ufw status | grep -q 'Status: active'; then
  ufw allow 80/tcp
  echo "    ufw: allowed 80/tcp"
fi

echo ""
echo "==> Next steps (manual):"
echo "  1. Add GitHub Actions secrets (see docs/DEPLOY.md)"
echo "  2. Copy env file:"
echo "       cp $DEPLOY_PATH/docker/deploy.env.example $DEPLOY_PATH/.env"
echo "  3. Edit secrets:"
echo "       nano $DEPLOY_PATH/.env"
echo "       # Set JWT_SECRET and CORS_ORIGIN"
echo "  4. Push to master branch — GitHub Actions will deploy automatically"
echo ""
echo "Done."
