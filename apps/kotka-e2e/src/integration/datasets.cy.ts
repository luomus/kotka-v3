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
    const tagName = 'e2e testing tag';
    const personsResponsible = 'Testing, E2E';

    before(() => {
      cy.setUserAsLoggedIn();
      cy.visit('/tags');

      // search for test tag
      cy.get('.ag-floating-filter[aria-colindex=2] input').first().type(tagName);
      cy.get('.ag-floating-filter[aria-colindex=3] input').first().type(personsResponsible);

      // remove test tag if it already exists
      cy.get('.edit-button').should('have.length.lt', 2).then(editButtons => {
        if (editButtons.length === 1) {
          cy.get('.edit-button').first().click();
          cy.get('[data-cy=form-delete]').click();
          cy.get('[data-cy=confirm-ok]').click();
          cy.url({ timeout: 10000 }).should('equal', Cypress.config('baseUrl') + '/tags');
        }
      });
    });

    beforeEach(() => {
      cy.get('#datasets-menu').click();
      cy.get('[data-cy=datasets-add]').click();
    });

    it('should show form validations', () => {
      cy.get('#root_datasetName_en').type(tagName);
      cy.get('#root_personsResponsible').type(personsResponsible);
      cy.get('form').submit();
      cy.get('.laji-form-error-list').should('be.visible');
    });

    it('should save and delete dataset', () => {
      cy.get('#root_datasetName_en').type(tagName);
      cy.get('#root_personsResponsible').type(personsResponsible);
      cy.get('#root_description_en').type('Test');
      cy.get('form').submit();

      cy.get('[data-cy=toast]', { timeout: 40000 }).should('have.text', 'Save success!');
      cy.get('[data-cy=toast-close]').click();
      cy.get('[data-cy=main-header]').should('contain', 'Edit tag');

      cy.get('[data-cy=form-delete]').click();
      cy.get('[data-cy=confirm-ok]').click();

      cy.get('[data-cy=toast]', { timeout: 10000 }).should('have.text', 'Success!');
      cy.get('[data-cy=toast-close]').click();
      cy.url().should('equal', Cypress.config('baseUrl') + '/tags');
    });
  });
});
