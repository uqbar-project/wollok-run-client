FROM node:12

WORKDIR /usr/src/app

RUN groupadd -r app && useradd -r -m -g app app
RUN chown app:app .
USER app

# Create app directory

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]