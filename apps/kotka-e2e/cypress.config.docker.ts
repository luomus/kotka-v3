import { defineConfig } from 'cypress';

export default defineConfig({
  fileServerFolder: '.',
  modifyObstructiveCode: false,
  video: false,
  screenshotOnRunFailure: false,
  chromeWebSecurity: false,
  e2e: {
    specPattern: './src/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
  },
  retries: 2
});
