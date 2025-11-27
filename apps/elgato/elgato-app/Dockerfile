FROM node:22.21.1-alpine3.22
RUN apk add --no-cache avahi avahi-tools curl openssl tzdata

WORKDIR /usr/elgato
CMD ["sh", "./entrypoint.sh"]
EXPOSE 3101/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3101/api/health || exit 1

COPY apps/elgato/elgato-app/entrypoint.sh .

# Copy the app itself
COPY ./dist/apps/elgato/elgato-backend/ .
