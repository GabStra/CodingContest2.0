FROM alpine:latest
RUN apk --no-cache add --update nodejs npm g++ libseccomp-dev
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD [ "node", "./dist/Worker/src/index.js" ]
EXPOSE 80