# Stage 1: Base image
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /usr/src/app

# Stage 2: Development dependencies
FROM base AS development
ENV NODE_ENV=development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
RUN pnpm install

COPY . .
RUN pnpm --filter @baby-tracker/shared-types build

EXPOSE 3000
CMD ["pnpm", "--filter", "api", "start:dev"]

# Stage 3: Build application
FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
RUN pnpm install

COPY . .
RUN pnpm --filter @baby-tracker/shared-types build
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

# Stage 4: Production runner
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --prod --ignore-scripts
RUN pnpm --filter api prisma:generate

# Copy build artifacts and prisma schema
COPY --from=builder /usr/src/app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/api/prisma ./apps/api/prisma

EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter api exec prisma migrate deploy && pnpm --filter api start:prod"]
