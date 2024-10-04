FROM node:alpine as builder

COPY package*.json ./
RUN yarn install

COPY . .

RUN ENVIRONMENT=production yarn run build

FROM nginx:alpine as production-build
COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /dist /usr/share/nginx/html
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
