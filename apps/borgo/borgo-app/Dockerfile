FROM nginx:stable-alpine@sha256:583b7f2fce1cdb8da5ad5c39ebd3c33b98b87d493190e548bdee1fa8c619c311
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80/tcp

COPY ./apps/borgo/borgo-app/default.conf /etc/nginx/conf.d

COPY ./dist/apps/borgo/borgo-web /usr/share/nginx/html
