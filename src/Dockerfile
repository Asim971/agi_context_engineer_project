# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Google clasp
RUN npm install -g @google/clasp

# Copy the rest of the application's source code from the host to the image's filesystem.
COPY . .

# Command to run when the container starts
# For example, you can log in to clasp or pull/push projects.
# This is a placeholder.
CMD ["bash"]
