FROM nginx:stable-alpine
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80/tcp

COPY ./apps/suite/default.conf /etc/nginx/conf.d

COPY ./dist/apps/suite /usr/share/nginx/html
