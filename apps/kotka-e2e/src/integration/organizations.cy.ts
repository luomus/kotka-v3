describe('organizations', () => {
  beforeEach(() => {
    cy.setUserAsLoggedIn();
    cy.visit('/organizations');
  });

  describe('organization table', () => {
    it('should be able to filter by the hidden field', () => {
      const selectSelector = '.ag-header-row-column-filter select';

      cy.get('[data-cy=total-count]').invoke('text').then(totalCountString => {
        const totalCount = parseInt(totalCountString, 10);

        cy.get(selectSelector).first().select('No');

        cy.get('[data-cy=total-count]').invoke('text')
          .should('not.eq', totalCountString)
          .then(parseInt)
          .should('be.a', 'number')
          .should('be.gt', 0)
          .should('be.lt', totalCount);
        }
      );
    });
  });

  describe('organization form', () => {
    const organizationName = 'e2e testing organization';

    before(() => {
      cy.setUserAsLoggedIn();
      cy.visit('/organizations');

      // search for test organization
      cy.get('.ag-floating-filter[aria-colindex=2] input').first().type(organizationName);

      // remove the test organization if it already exists
      cy.get('[data-cy=total-count]').contains(/^[01]$/).invoke('text').then(text => {
        cy.log(text);
        if (text === '1') {
          cy.get('.edit-button').first().click();
          cy.get('[data-cy=form-delete]').click();
          cy.get('[data-cy=confirm-ok]').click();
          cy.url({ timeout: 10000 }).should('equal', Cypress.config('baseUrl') + '/organizations');
        }
      });
    });

    beforeEach(() => {
      cy.get('#organizations-menu').click();
      cy.get('[data-cy=organizations-add]').click();
    });

    it('should save and delete organization', () => {
      cy.get('#root_datasetID-add').click();
      cy.get('#root_datasetID_0').type('test');
      cy.get('.rw-popup .rw-list-option').first().click();
      cy.get('#root_datasetID_0').first().should('include', /test/i);

      cy.get('#root_organizationLevel1_en').type(organizationName);

      cy.get('#root_additionalIDs-add').click();
      cy.get('#root_additionalIDs_0').type('test:');

      cy.get('[data-cy=form-submit]').click();
      cy.get('.laji-form-warning-list .warning-panel').should('be.visible');
      cy.get('.laji-form-warning-list .error-panel').should('not.exist');
      cy.get('.laji-form-warning-list .warning-panel .btn-success').click();

      cy.get('[data-cy=toast]', { timeout: 40000 }).should('have.text', 'Save success!');
      cy.get('[data-cy=toast-close]').click();
      cy.get('[data-cy=main-header]').should('contain', 'Edit organization');

      cy.get('[data-cy=form-delete]').click();
      cy.get('[data-cy=confirm-ok]').click();

      cy.get('[data-cy=toast]', { timeout: 10000 }).should('have.text', 'Success!');
      cy.get('[data-cy=toast-close]').click();
      cy.url().should('equal', Cypress.config('baseUrl') + '/organizations');
    });
  });
});
