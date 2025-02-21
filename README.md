# KotkaV3

This is the new Angular and Nestjs-based version of Kotka CMS.

Start the development server with docker-compose using `docker-compose up` in the root of the project.

## Testing

### Unit tests
```
npm run test:all // test all
npm run test kotka-api // test single project
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

## Useful commands
```
npx nx g lib --directory <folder> --name <lib name> // create lib
npx nx g rm <lib name> // remove lib
npx nx g mv --projectName <lib name> --newProjectName <new name> --destination <folder> --importPath <ts import path> // move or rename lib
```
