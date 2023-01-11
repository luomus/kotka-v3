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
    login(email?: string, password?: string, next?: string): void;
    logout(): void;
  }
}

Cypress.Commands.add('login', (email, password, next = '/') => {
  cy.visit(next);

  cy.get('#user-menu,#local-login').invoke('attr', 'id').then(idValue => {
    if (idValue === 'local-login') {
      cy.fixture('test-user').then((defaultUser: { email: string, password: string }) => {
        email = email || defaultUser.email;
        password = password || defaultUser.password;
        cy.get('#local-login').click();
        cy.get('[name="email"]').type(email);
        cy.get('[name="password"]').type(password);
        cy.get('button.submit').click();
        cy.url().should('equal', Cypress.config('baseUrl') + next); // wait for login to complete
      });
    }
  });
});

Cypress.Commands.add('logout', () => {
  cy.visit('/');

  cy.get('#user-menu,#local-login').invoke('attr', 'id').then(idValue => {
    if (idValue === 'user-menu') {
      cy.get('#user-menu').click();
      cy.get('#user-logout').click();
    }
  });
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
