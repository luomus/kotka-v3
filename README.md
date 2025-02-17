

# KotkaV3

This is the the new Angular and Nestjs-based version of kotka CMS.

Start for localhost in docker-compose using `docker-compose up` in the root of the projent, if permissions are denied comment out `USER node`-line in the Docerfiles under `tools/docker` for both kotka and api.

## Testing

### Unit tests
```
npm run test kotka-api
```

### End-to-end tests

Before running the tests, you should put CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD to the .env file or .env.e2e file if you are running the tests with docker. There are two ways to run e2e tests:

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
    docker-compose -f ./docker-compose.e2e.yml --env-file .env.e2e up 
    ```
