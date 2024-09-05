# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application and export static HTML
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the exported Next.js build output to Nginx's HTML directory
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
