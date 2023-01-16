

# KotkaV3

This is the the new Angular and Nestjs-based version of kotka CMS.

Start for localhost in docker-compose using `docker-compose up` in the root of the projent, if permissions are denied comment out `USER node`-line in the Docerfiles under `tools/docker` for both kotka and api.

## Testing

There are two ways to run e2e tests:

1. While the application is running, run
   ```
   npm run e2e
   ```
   or
   ```
   npm run e2e:watch
   ```

3. Run the tests with docker-compose:
    ```
    docker-compose -f docker-compose.e2e.yml up
    ```
