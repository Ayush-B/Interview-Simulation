# ---- base deps layer ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- runtime layer ----
FROM node:22-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy node_modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 4000

USER app

CMD ["node", "src/server.js"]