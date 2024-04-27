# Use an official Node.js runtime as the base image
FROM node:20

# Create app folder
RUN mkdir /app

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package-lock.json package.json ./

# Clean npm cache
RUN npm cache clean --force

# Install npm and verify installation

RUN npm install --verbose

# Install the application dependencies using npm ci
RUN npm install --update

# Install global dependencies
RUN npm install -g nodemon pm2

# Bundle the app source inside the Docker image
COPY . .

# The application's default port
EXPOSE 8080

# Run npm update to update packages
RUN npm update

# Define the command to run the app using npm start
CMD ["npm", "start"]
