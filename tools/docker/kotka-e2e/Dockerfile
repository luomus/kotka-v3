ARG NODE_VERSION='20.10.0'
ARG CYPRESS_VERSION='13.3.2'

FROM cypress/factory:latest

RUN apt-get update && apt-get -y install bzip2 g++ make python-is-python3

WORKDIR /app
RUN chown -Rh node:node /app
# USER node

COPY --chown=node:node ./decorate-angular-cli.js ./package*.json ./

RUN npm ci && npm cache clean --force

COPY --chown=node:node . .

CMD npm run ng -- e2e kotka-e2e --configuration docker
