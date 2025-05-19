# Accept a build-arg for the API base URL
ARG API_BASE_URL=""
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
# Expose that arg as an env var during build
ENV NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}

# Copier seulement ce qui est nécessaire en prod
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm","start"]