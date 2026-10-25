# syntax=docker/dockerfile:1

# ---------- build stage ----------
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# The official node image ships a non-root `node` user.
USER node
EXPOSE 8080
CMD ["node", "dist/server/index.js"]
