FROM node:20-alpine AS backend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.server.json ./
COPY server.ts ./
COPY app.ts ./
COPY config/ ./config/
COPY controllers/ ./controllers/
COPY routes/ ./routes/
COPY services/ ./services/
COPY models/ ./models/
COPY middleware/ ./middleware/
COPY helpers/ ./helpers/
COPY types/ ./types/
COPY database/ ./database/

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=backend-build /app/dist ./dist
COPY drizzle.config.ts ./
COPY database/ ./database/
COPY drizzle/ ./drizzle/

RUN npm install drizzle-kit tsx

EXPOSE 3000

CMD ["sh", "-c", "npx drizzle-kit push && node dist/server.js"]
