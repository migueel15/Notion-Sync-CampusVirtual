FROM node:20.16.0-alpine
WORKDIR /app

COPY package.json /app
RUN npm install
COPY . /app

RUN npm run build
CMD ["npm", "start"]
