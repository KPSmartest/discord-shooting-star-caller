FROM node:20-slim

WORKDIR /app

# Install dependencies first for better layer caching. better-sqlite3 fetches its prebuilt
# native binary during install (node:20-slim is glibc-based, so the prebuilt works).
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and compile TypeScript -> JavaScript.
COPY . .
RUN yarn build

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "index.js"]
