FROM node:20.10.0-alpine
WORKDIR /usr/src/app
CMD ["npm", "start"]
EXPOSE 3333/tcp

RUN corepack enable && corepack prepare pnpm@latest-8 --activate

# Install dependencies. When these don't update we can use a cached version if available
COPY ./dist/apps/feeds/backend/package.json .
COPY ./dist/apps/feeds/backend/pnpm-lock.yaml .
RUN pnpm install

# Copy the app itself
COPY ./dist/apps/feeds/backend .
COPY ./dist/apps/feeds/web/ web
