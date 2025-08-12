# Use the latest Node.js image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install Playwright dependencies
RUN npx playwright install-deps
RUN npx playwright install

# Copy the application code
COPY . .

# Expose port 8080
EXPOSE 8080

# Run the application on port 8080
CMD ["node", "server.js"]
