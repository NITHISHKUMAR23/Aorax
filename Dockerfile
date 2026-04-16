# Use lightweight Node image
FROM node:18-alpine

# Create app directory inside container
WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy remaining code
COPY . .

# Expose app port
EXPOSE 3000

# Start app
CMD ["node", "server.js"] 