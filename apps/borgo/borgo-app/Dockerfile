FROM nginx:stable-alpine@sha256:901e593c95dc85f5a729f5765516321366ef4ac401821431d408897e95287d0a
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80/tcp

COPY ./apps/borgo/borgo-app/default.conf /etc/nginx/conf.d

COPY ./dist/apps/borgo/borgo-web /usr/share/nginx/html
