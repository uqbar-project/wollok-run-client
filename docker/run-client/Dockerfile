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


####################
# Development Image
####################

FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]


####################
# Production Builder
####################

FROM base AS builder
RUN npm ci --only=production
COPY . .
RUN npm run build

####################
# Production
####################

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15 AS prod
COPY --from=builder /usr/src/app/build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
