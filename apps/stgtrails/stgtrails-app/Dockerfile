FROM node:22.21.1-alpine3.22
RUN apk add --no-cache curl openssl

WORKDIR /usr/stgtrails
CMD ["sh", "./entrypoint.sh"]
EXPOSE 3104/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3104/api/health || exit 1

COPY apps/stgtrails/stgtrails-app/entrypoint.sh .

COPY ./dist/apps/stgtrails/stgtrails-backend .
