FROM node:24.22.2-alpine3.24
RUN apk add --no-cache curl openssl
RUN corepack enable

WORKDIR /usr/trailcare
CMD ["sh", "./entrypoint.sh"]
EXPOSE 3105/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3105/api/health || exit 1

COPY apps/trailcare/trailcare-app/entrypoint.sh .

COPY ./dist/apps/trailcare/trailcare-backend .
