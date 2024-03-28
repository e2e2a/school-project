# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# If there are production dependencies, use this instead
# RUN npm ci --only=production

# Bundle the app source inside the Docker image
COPY . .

# The application's default port
EXPOSE 8080

CMD ["npm", "start"]