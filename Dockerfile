# Production Node.js Container for Rahul A. Portfolio
FROM node:24-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose server port
EXPOSE 5000

# Run server
CMD ["node", "server.js"]

