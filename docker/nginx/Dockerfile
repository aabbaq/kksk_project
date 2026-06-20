FROM nginx:1.27-alpine

COPY docker/nginx/gateway.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/gateway-locations.inc /etc/nginx/conf.d/gateway-locations.inc

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
