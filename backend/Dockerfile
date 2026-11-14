FROM node:20-bookworm-slim

# Install system dependencies for Chromium, Remotion, and Git
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ffmpeg \
    git \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcups2 \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer and Remotion to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production
ENV PORT=5001

WORKDIR /app

# Copy manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Generate Prisma and compile TypeScript
RUN npm run build

# Expose port
EXPOSE 5001

# Start the Express server
CMD ["npm", "start"]
