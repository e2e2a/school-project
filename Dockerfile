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

# Install pm2 globally
RUN npm install pm2 -g

# Bundle the app source inside the Docker image
COPY . .

# The application's default port
EXPOSE 8080

# Define the command to run the app using pm2
# CMD [ "pm2-runtime", "start", "index.js" ]

CMD ["npm", "start"]