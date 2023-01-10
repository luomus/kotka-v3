describe('user', () => {
  beforeEach(() => cy.visit('/tags'));

  it('should automatically redirect to login page', () => {
    cy.url().should('include', 'laji-auth');
  });

  it('should login user', () => {
    cy.login();
    cy.get('h1').should('contain', 'Tags');
    cy.logout();
  });

  it('should redirect to login page after logout', () => {
    cy.login();
    cy.logout();
    cy.url().should('include', 'laji-auth');
  });
});
