FROM node:22.22.0-alpine3.22
RUN apk add --no-cache curl openssl

WORKDIR /usr/feeds
CMD ["sh", "./entrypoint.sh"]
EXPOSE 3333/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3333/api/health || exit 1

COPY apps/feeds/feeds-app/entrypoint.sh .

COPY ./dist/apps/feeds/feeds-backend .
