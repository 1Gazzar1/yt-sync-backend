FROM node:20-alpine

WORKDIR /app

COPY  package*.json ./

# install python and pip
RUN apk add --no-cache python3 py3-pip

RUN apk add pipx 

RUN pipx install yt-dlp[default]

RUN npm ci

RUN PATH="$PATH:/root/.local/bin" 

COPY . . 

RUN npm run build 

EXPOSE 8080
ENTRYPOINT ["npm", "run","start"]