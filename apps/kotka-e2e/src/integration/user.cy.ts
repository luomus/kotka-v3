describe('user', () => {
  it('should automatically redirect to login page', () => {
    cy.visit('/');
    cy.url().should('include', 'laji-auth');
  });

  it('should show the correct page after login', () => {
    cy.fixture('test-user').then((defaultUser: { email: string, password: string }) => {
      cy.visit('/tags');
      cy.login(defaultUser.email, defaultUser.password);
      cy.url().should('equal', Cypress.config('baseUrl') + '/tags');
      cy.get('[data-cy=main-header]').should('contain', 'Tags');
    });
  });

  it('should redirect to login page after logout', () => {
    cy.setUserAsLoggedIn();
    cy.visit('/');
    cy.logout();
    cy.url().should('include', 'laji-auth');
  });
});
