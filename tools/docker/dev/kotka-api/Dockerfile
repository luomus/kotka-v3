FROM node:14

WORKDIR /app
RUN chown -Rh node:node /app
# USER node

COPY --chown=node:node ./decorate-angular-cli.js ./package*.json ./

RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY --chown=node:node . .

EXPOSE 3333

CMD npm run start -- kotka-api --host 0.0.0.0
