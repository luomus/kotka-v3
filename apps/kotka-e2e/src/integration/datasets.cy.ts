describe('datasets', () => {
  beforeEach(() => {
    cy.setUserAsLoggedIn();
    cy.visit('/tags');
  });

  it('should show the correct title when editing a dataset', () => {
    cy.get('.edit-button').first().click();
    cy.get('[data-cy=main-header]').should('contain', 'Edit tag');
  });

  it('should show the correct title when adding a dataset', () => {
    cy.get('#datasets-menu').click();
    cy.get('[data-cy=datasets-add]').click();
    cy.get('[data-cy=main-header]').should('contain', 'Add tag');
  });

  describe('dataset form', () => {
    beforeEach(() => {
      cy.get('#datasets-menu').click();
      cy.get('[data-cy=datasets-add]').click();
    });

    it('should show form validations', () => {
      cy.get('#root_personsResponsible').type('Testing, E2E');
      cy.get('#root_description_en').type('Desc');
      cy.get('form').submit();
      cy.get('.laji-form-error-list').should('be.visible');
    });

    it('should save and delete dataset', () => {
      cy.get('#root_datasetName_en').type('Tag name 123');
      cy.get('#root_personsResponsible').type('Testing, E2E');
      cy.get('#root_description_en').type('Desc');
      cy.get('form').submit();

      cy.get('[data-cy=toast]', { timeout: 10000 }).should('have.text', 'Save success!');
      cy.get('[data-cy=toast-close]').click();
      cy.get('[data-cy=main-header]').should('contain', 'Edit tag');

      cy.get('[data-cy=form-delete]').click();
      cy.get('[data-cy=confirm-ok]').click();

      cy.get('[data-cy=toast]').should('have.text', 'Success!');
      cy.get('[data-cy=toast-close]').click();
      cy.url().should('equal', Cypress.config('baseUrl') + '/tags');
    });
  });
});
