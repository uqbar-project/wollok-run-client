####################
# Base Image
####################

FROM node:12 as base

# Create app directory
WORKDIR /usr/src/app

# Avoid running as root
RUN groupadd -r app && useradd -r -m -g app app
RUN chown app:app .
USER app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Copy app source
COPY . .

####################
# Development Image
####################

FROM base as dev
EXPOSE 3000
CMD [ "npm", "start" ]


# If you are building your code for production
# RUN npm ci --only=production
