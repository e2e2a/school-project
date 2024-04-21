# Use the official Node.js 20 image as base
FROM node:20

# Create app directory
RUN mkdir -p /app

# Set /app as the working directory
WORKDIR /app

# Copy the entire project to /app inside the Docker image
COPY . /app

# Install PM2 globally
RUN npm install pm2 -g

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["npm", "start"]
