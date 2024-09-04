FROM node:20.17.0-alpine
RUN apk add --no-cache avahi avahi-tools tzdata


WORKDIR /usr/elgato
CMD ["npm", "start"]
EXPOSE 3101/tcp

# Install dependencies. When these don't update we can use a cached version if available
COPY ./dist/apps/elgato/elgato-backend/package.json .
COPY ./dist/apps/elgato/elgato-backend/yarn.lock .
RUN yarn install --frozen-lockfile

# Copy the app itself
COPY ./dist/apps/elgato/elgato-backend/ .
RUN sed -i 's#file:./elgato.db#file:/usr/elgato/sqlite/elgato.db#' schema.prisma
