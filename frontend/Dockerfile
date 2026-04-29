# Use a lightweight Node image
FROM node:20-alpine

WORKDIR /app

# Install dependencies separately for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the default Vite port
EXPOSE 5173

CMD ["npm", "run", "dev"]