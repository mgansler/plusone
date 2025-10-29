FROM node:22.21.1-alpine
RUN apk add --no-cache avahi avahi-tools curl openssl tzdata

WORKDIR /usr/elgato
CMD ["npm", "start"]
EXPOSE 3101/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3101/api/health || exit 1

# Install dependencies. When these don't update we can use a cached version if available
COPY ./dist/apps/elgato/elgato-backend/package.json .
COPY ./dist/apps/elgato/elgato-backend/yarn.lock .
RUN yarn install --frozen-lockfile

# Copy the app itself
COPY ./dist/apps/elgato/elgato-backend/ .
