FROM node:14

WORKDIR /app
RUN chown -Rh node:node /app
# USER node
ENV HOST "0.0.0.0"

COPY --chown=node:node ./decorate-angular-cli.js ./package*.json ./

RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY --chown=node:node . .

EXPOSE 3333

CMD npm run start -- kotka-api
