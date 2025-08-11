# Use Node.js image to serve the app
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Build the React app
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN echo "Using API URL: $VITE_API_URL"
RUN npm run build

# Install a simple static file server (like serve)
RUN npm install -g serve

# Serve the build directory
CMD ["serve", "-s", "dist", "-l", "4001"]

EXPOSE 4001
