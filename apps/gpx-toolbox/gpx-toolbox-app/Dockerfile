FROM node:24.16.0-alpine3.22
RUN apk add --no-cache curl openssl
RUN corepack enable

WORKDIR /usr/gpx-toolbox
CMD ["sh", "./entrypoint.sh"]
EXPOSE 3333/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3333/api/health || exit 1

COPY apps/gpx-toolbox/gpx-toolbox-app/entrypoint.sh .

COPY ./dist/apps/gpx-toolbox/gpx-toolbox-backend .
