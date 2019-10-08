FROM node:10

WORKDIR /blockchain-service
ADD ./package.json /blockchain-service/package.json
ADD ./package-lock.json /blockchain-service/package-lock.json
ADD ./service.js /blockchain-service/service.js
ADD ./lib /blockchain-service/lib

RUN npm i

CMD ["node", "/blockchain-service/service.js"]