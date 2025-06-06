FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Development mode
ENV NODE_ENV=development
ENV REACT_APP_API_URL=http://localhost:8000

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 