FROM node:22

WORKDIR /app
RUN chown -Rh node:node /app
# USER node

ENV HOST="0.0.0.0"
ENV CYPRESS_INSTALL_BINARY=0
ENV NX_ISOLATE_PLUGINS=false
ENV NX_CACHE_DIRECTORY=/tmp/.nx/cache
ENV NX_WORKSPACE_DATA_DIRECTORY=/tmp/.nx/workspace-data

COPY --chown=node:node ./package*.json ./

RUN npm ci && npm cache clean --force

COPY --chown=node:node . .

EXPOSE 3333

CMD rm -rf /tmp/.nx/workspace-data && npm run start -- kotka-api
