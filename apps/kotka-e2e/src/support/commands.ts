// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    setUserAsLoggedIn(email?: string, password?: string): void;
    login(email: string, password: string): void;
    logout(): void;
  }
}

Cypress.Commands.add('setUserAsLoggedIn', (email, password) => {
  cy.fixture('test-user').then((defaultUser: { email: string, password: string }) => {
    const userEmail = email || defaultUser.email;
    const userPassword = password || defaultUser.password;

    cy.session([userEmail, userPassword], () => {
      cy.visit('/');
      cy.login(userEmail, userPassword);
      cy.url({ timeout: 7000 }).should('equal', Cypress.config('baseUrl') + '/'); // wait for login to complete
    },{
      validate() {
        cy.visit('/');
        cy.get('#user-menu,#local-login').invoke('attr', 'id').should('eq', 'user-menu');
      }
    });
  });
});

Cypress.Commands.add('login', (email, password) => {
  cy.get('#local-login').click();
  cy.get('[name="email"]').type(email);
  cy.get('[name="password"]').type(password);
  cy.get('button.submit').click();
});

Cypress.Commands.add('logout', () => {
  cy.get('#user-menu').click();
  cy.get('#user-logout').click();
});

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
