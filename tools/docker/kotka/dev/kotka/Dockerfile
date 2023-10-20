FROM node:16

WORKDIR /app
RUN chown -Rh node:node /app
# USER node

ENV CYPRESS_INSTALL_BINARY 0

COPY --chown=node:node ./decorate-angular-cli.js ./package*.json ./

RUN npm ci && npm cache clean --force

RUN mkdir node_modules/.cache && chown -R node:node node_modules/.cache

COPY --chown=node:node . .

EXPOSE 4200

CMD npm run start -- kotka --host 0.0.0.0
