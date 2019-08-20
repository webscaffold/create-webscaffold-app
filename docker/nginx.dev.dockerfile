# Use the standard Nginx image from Docker Hub
FROM nginx:latest-alpine

# The Dockerfile's author
LABEL maintainer="<your.email@doamin.com>"

# Copy the configuration file from the current directory and paste
# it inside the container to use it as Nginx's default config.
COPY ./nginx.dev.conf /etc/nginx/nginx.conf

# Port 8080 of the container will be exposed and then mapped to port
# 8080 of our host machine via Compose. This way we'll be able to
# access the server via localhost:8080 on our host.
EXPOSE 80

# To run:
# docker run --name dev-nginx -d -p 8080:80 dev-content-nginx
