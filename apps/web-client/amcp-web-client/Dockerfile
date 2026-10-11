# Multi-stage build for the AMCP Angular web dashboard (SSR app).
#
# Stage 1 installs deps and runs `ng build`, which (per angular.json,
# outputMode: "server") produces both a browser bundle and a Node/Express
# SSR server under dist/amcp-web-client/{browser,server}.
#
# Stage 2 is a slim Node runtime that just runs the generated SSR server
# (src/server.ts -> dist/.../server/server.mjs), which serves the static
# browser bundle AND server-renders routes on the same Express app — so
# no separate nginx config is needed.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist/amcp-web-client ./dist/amcp-web-client
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# SSR server defaults to PORT env var, falling back to 4000 (src/server.ts).
ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/amcp-web-client/server/server.mjs"]
