FROM nginx:stable-alpine
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80/tcp

COPY ./apps/borgo/borgo-app/default.conf /etc/nginx/conf.d

COPY ./dist/apps/borgo/borgo-web /usr/share/nginx/html
