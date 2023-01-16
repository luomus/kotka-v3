FROM cypress/base:14.19.0

WORKDIR /app
RUN chown -Rh node:node /app
# USER node

COPY --chown=node:node ./decorate-angular-cli.js ./package*.json ./

RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY --chown=node:node . .

CMD npm run ng -- e2e kotka-e2e --configuration docker
