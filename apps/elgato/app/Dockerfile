FROM node:20.10.0-alpine
WORKDIR /usr/elgato
CMD ["npm", "start"]
EXPOSE 3000/tcp

RUN corepack enable && corepack prepare pnpm@latest-8 --activate

RUN apk add --no-cache avahi avahi-tools tzdata

# Install dependencies. When these don't update we can use a cached version if available
COPY ./dist/apps/elgato/backend/package.json .
COPY ./dist/apps/elgato/backend/pnpm-lock.yaml .
RUN pnpm install

# Copy the app itself
COPY ./dist/apps/elgato/backend/ .
COPY ./dist/apps/elgato/frontend/ web
RUN sed -i 's#file:./elgato.db#file:/usr/elgato/sqlite/elgato.db#' schema.prisma
