# -------------------------
# Builder: Compile TypeScript to JS
# -------------------------

FROM node:18-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npx pnpm -r i --frozen-lockfile

# copy sources
COPY src ./src
COPY tsconfig.json ./

# prisma
COPY ./prisma ./prisma
RUN npx prisma generate

# compile
RUN npx pnpm build

# -------------------------
# Deps-prod: Obtain node_modules that contains just production dependencies
# -------------------------

FROM node:18-alpine as deps-prod

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npx pnpm -r i --frozen-lockfile --prod

COPY ./prisma ./prisma
RUN npx prisma generate

# -------------------------
# Runner: Production to run
# -------------------------

FROM node:18-alpine as runner

LABEL name "nanamis-discord-bot"

USER node
ENV NODE_ENV production

# copy all files from layers above
COPY package.json ./
COPY --chown=node:node --from=deps-prod /app/node_modules ./node_modules
COPY --chown=node:node --from=deps-prod /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/dist ./dist

# Set the working directory to /app
WORKDIR ./

CMD ["node", "dist/index.js"]