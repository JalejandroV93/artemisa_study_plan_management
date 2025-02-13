# BUILD STAGE
FROM node:20.10-alpine AS builder

WORKDIR /app

# Agregar variable de entorno para producciÃ³n
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# 1. Copiar solo archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# 2. Instalar dependencias (incluyendo devDependencies para el build)
RUN npm install --frozen-lockfile --include=dev

# 3. Copiar todo el cÃ³digo fuente incluyendo configuraciones
COPY . .

# 4. Generar Prisma
RUN npm run prisma:generate

# 5. Verificar estructura de archivos (solo para debug)
RUN ls -lR src/components && ls -lR src/contexts

# 6. Build de Next.js
RUN npm run build

# PRODUCTION STAGE
FROM node:20.10-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat curl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos con los permisos correctos desde el principio
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/worker.ts ./worker.ts


# Eliminar la copia de .env (mejor usar variables de entorno)
USER nextjs

EXPOSE 3000

# Agregar migraciones de Prisma al iniciar
CMD ["sh", "-c", "npm run prisma:migrate && npm run start"]
