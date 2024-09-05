# Use the official Nginx image
FROM nginx:alpine

# Copy the entire content of the current directory into the nginx root directory
COPY ./out/ /usr/share/nginx/html/

# Nginx listens on port 80 by default
EXPOSE 80
