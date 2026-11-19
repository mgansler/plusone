FROM nginx:stable-alpine@sha256:3bc3836dc0be3b811f238210360bf8e7ca8a2d0effdae46160bf1f3578710051
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80/tcp

COPY ./apps/borgo/borgo-app/default.conf /etc/nginx/conf.d

COPY ./dist/apps/borgo/borgo-web /usr/share/nginx/html
