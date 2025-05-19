# 1) Declare the build‐arg at top (global to all stages)
ARG API_BASE_URL=""

###############################################################################
# Builder stage: next build runs here, so we inject the API base URL as ENV
###############################################################################
FROM node:18-alpine AS builder
WORKDIR /app

# expose the build‐arg to this stage
ARG API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}

# install dependencies
COPY package*.json ./
RUN npm ci

# copy source & build
COPY . .
RUN npm run build

###############################################################################
# Runner stage: only needs to serve the already built Next.js output
###############################################################################
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# copy production artifacts from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm","start"]
