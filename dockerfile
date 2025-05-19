# Étape 1 : builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copier package.json + lockfile et installer
COPY package*.json ./
RUN npm ci

# Copier le reste et builder Next.js
COPY . .
RUN npm run build

# Étape 2 : runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copier seulement ce qui est nécessaire en prod
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm","start"]