FROM node:20.13.0-alpine
RUN apk add --no-cache avahi avahi-tools tzdata


WORKDIR /usr/elgato
CMD ["npm", "start"]
EXPOSE 3000/tcp

# Install dependencies. When these don't update we can use a cached version if available
COPY ./dist/apps/elgato/backend/package.json .
COPY ./dist/apps/elgato/backend/yarn.lock .
RUN yarn install --frozen-lockfile

# Copy the app itself
COPY ./dist/apps/elgato/backend/ .
COPY ./dist/apps/elgato/frontend/ web
RUN sed -i 's#file:./elgato.db#file:/usr/elgato/sqlite/elgato.db#' schema.prisma
