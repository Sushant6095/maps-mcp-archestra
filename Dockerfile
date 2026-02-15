FROM europe-west1-docker.pkg.dev/friendly-path-465518-r6/archestra-public/mcp-server-base:latest

WORKDIR /tmp/build

COPY package*.json ./
RUN npm ci

COPY . .

# Now build (dist folder will be created by tsc)
RUN npm run build

# Switch to app directory (WORKDIR creates it if it doesn't exist)
WORKDIR /app

# Copy compiled output and node_modules to runtime directory
RUN cp -r /tmp/build/dist ./dist && \
    cp -r /tmp/build/node_modules ./node_modules

CMD ["node", "dist/server.js"]