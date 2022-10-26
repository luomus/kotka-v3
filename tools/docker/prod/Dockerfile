FROM node:14 as builder
ENV NODE_ENV build

WORKDIR /app
RUN chown -Rh node:node /app
USER node

# Copy the things that are needed for installing corrent node_modules
COPY --chown=node:node ./package*.json ./decorate-angular-cli.js ./

RUN npm ci \
 && npm cache clean --force

# Copy to image only the files that are really needed
COPY --chown=node:node ./tsconfig.base.json ./nx.json ./angular.json ./
COPY --chown=node:node ./apps ./apps
COPY --chown=node:node ./libs ./libs

# Build all versions of store so that they can be cherry-picked in other targets as needed
RUN npm run ng -- build kotka-api \
 && npm run ng -- build kotka


FROM nginxinc/nginx-unprivileged as kotka

COPY --from=builder /app/dist/apps/kotka /usr/share/nginx/html

EXPOSE 8080


FROM node:14 as kotka-api
ENV NODE_ENV production
ENV HOST "0.0.0.0"

WORKDIR /app
RUN chown -Rh node:node /app
USER node

COPY --chown=node:node --from=builder /app/dist/apps/kotka-api /app/package*.json ./

# Install only packages that are needed for prodcution
RUN npm ci --ignore-scripts --only=production \
 && npm cache clean --force

EXPOSE 3333

CMD [ "node", "main.js" ]
