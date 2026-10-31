FROM nginx:stable-alpine@sha256:0e52bd054126cdc040b1276c0af347aeb02a41b9cfe305d6094767ac30e97949
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80/tcp

COPY ./apps/borgo/borgo-app/default.conf /etc/nginx/conf.d

COPY ./dist/apps/borgo/borgo-web /usr/share/nginx/html
