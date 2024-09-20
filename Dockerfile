FROM node:20.16.0-alpine
WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm ci
COPY . /app

RUN apk add --no-cache libnotify dbus dbus-x11
ENV DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus

RUN npm run build
CMD ["npm", "start"]
