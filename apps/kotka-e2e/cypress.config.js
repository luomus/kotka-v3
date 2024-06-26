const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fileServerFolder: '.',
  modifyObstructiveCode: false,
  video: true,
  videosFolder: '../../dist/cypress/apps/kotka-e2e/videos',
  screenshotsFolder: '../../dist/cypress/apps/kotka-e2e/screenshots',
  chromeWebSecurity: false,
  e2e: {
    specPattern: './src/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
  },
});
