FROM nginx:stable-alpine
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80/tcp

COPY ./dist/apps/suite /usr/share/nginx/html
