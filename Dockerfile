FROM oven/bun:1.4.2 AS dependencies
WORKDIR /app
ENV HUSKY=0

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM dependencies AS build

COPY . .
RUN bun run build

FROM oven/bun:1.4.2-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/server ./src/server
COPY --from=build /app/src/shared ./src/shared
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["sh", "-c", "bun scripts/database.ts migrate && cd dist && exec bun index.js"]
