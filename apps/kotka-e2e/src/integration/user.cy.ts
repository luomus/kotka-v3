describe('user', () => {
  it('should automatically redirect to login page', () => {
    cy.visit('/');
    cy.url().should('include', 'laji-auth');
  });

  it('should show the correct page after login', () => {
    const userEmail = Cypress.env('TEST_EMAIL');
    const userPassword = Cypress.env('TEST_PASSWORD');

    if (!userEmail || !userPassword) {
      throw Error('Missing test email or password');
    }

    cy.visit('/tags');
    cy.login(userEmail, userPassword);
    cy.url().should('equal', Cypress.config('baseUrl') + '/tags');
    cy.get('[data-cy=main-header]').should('contain', 'Tags');
  });

  it('should redirect to old kotka logout page after logout', () => {
    cy.setUserAsLoggedIn();
    cy.visit('/');
    cy.logout();
    cy.url().should('include', '/user/logout');
  });
});
