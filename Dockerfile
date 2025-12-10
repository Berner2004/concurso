FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY public/ /usr/share/nginx/html/
# Si quieres usar nginx.conf personalizada:
# COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
