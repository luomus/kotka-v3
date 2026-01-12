FROM node:22

WORKDIR /app
RUN chown -Rh node:node /app
# USER node
ENV HOST "0.0.0.0"
ENV CYPRESS_INSTALL_BINARY 0

COPY --chown=node:node ./package*.json ./

RUN npm install --force && npm cache clean --force # TODO fix label-designer dependencies

COPY --chown=node:node . .

EXPOSE 3333

CMD npm run start -- kotka-api
