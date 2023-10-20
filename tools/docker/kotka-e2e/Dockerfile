FROM cypress/base:16.18.0

RUN apt-get update && apt-get -y install bzip2 g++ make

WORKDIR /app
RUN chown -Rh node:node /app
# USER node

COPY --chown=node:node ./decorate-angular-cli.js ./package*.json ./

RUN mkdir node_modules && mkdir node_modules/.cache && chown -R node:node node_modules && chown -R node:node node_modules/.cache
RUN npm ci && npm cache clean --force

COPY --chown=node:node . .

CMD npm run ng -- e2e kotka-e2e --configuration docker
