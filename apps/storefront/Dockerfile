FROM node:22-alpine AS build
WORKDIR /app
# better-sqlite3 has no prebuilt binary for node 22 on Alpine/musl: compile it here.
# Build stage only; the runtime stage copies the built node_modules and stays slim.
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/build build
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package.json .
# retention + export scripts (npm run contact:purge) run from source via tsx
COPY --from=build /app/scripts scripts
COPY --from=build /app/src/lib/server src/lib/server
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build"]
