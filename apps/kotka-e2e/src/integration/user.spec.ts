describe('user', () => {
  beforeEach(() => {
    cy.logout();
  });

  it('should automatically redirect to login page', () => {
    cy.visit('/');
    cy.url().should('include', 'laji-auth');
  });

  it('should show the correct page after login', () => {
    cy.login(undefined, undefined, '/tags');
    cy.get('[data-cy=main-header]').should('contain', 'Tags');
  });

  it('should redirect to login page after logout', () => {
    cy.login();
    cy.logout();
    cy.url().should('include', 'laji-auth');
  });
});
