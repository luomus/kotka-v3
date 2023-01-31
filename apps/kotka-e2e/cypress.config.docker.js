const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  modifyObstructiveCode: false,
  video: false,
  screenshotOnRunFailure: false,
  chromeWebSecurity: false,
  e2e: {
    specPattern: './src/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
  },
});
