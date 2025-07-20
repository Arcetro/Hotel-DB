# Use official Node.js LTS image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json if they exist (will be added later)
COPY package*.json ./

# Install dependencies (none yet, but this keeps the layer for future use)
RUN npm install || true

# Copy the rest of the backend code (empty for now)
COPY . .

# Expose backend port (adjust if needed)
EXPOSE 3001

# Default command (will be updated once server.js exists)
CMD ["node", "server.js"] 