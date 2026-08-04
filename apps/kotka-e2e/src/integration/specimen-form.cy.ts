describe('specimen form', () => {
  beforeEach(() => {
    cy.setUserAsLoggedIn();
  });

  it('should show the correct title for different specimen types', () => {
    cy.visit('/botany/specimens/add');
    cy.get('[data-cy=main-header]').should('contain', 'Create new botany specimen');

    cy.visit('/zoo/specimens/add');
    cy.get('[data-cy=main-header]').should('contain', 'Create new zoo specimen');
  });

  describe('form sidebar buttons', () => {
    beforeEach(() => {
      cy.visit('/botany/specimens/add');
      cy.get('[data-cy=specimen-form-sidebar]', { timeout: 15000 }).should('be.visible');
    });

    it('should toggle show advanced fields', () => {
      cy.get('#root_publicityRestrictions').should('not.exist');

      cy.get('[data-cy=specimen-form-sidebar]').contains('Show basic and advanced fields').click();
      cy.get('#root_publicityRestrictions').should('exist');
      cy.get('[data-cy=specimen-form-sidebar]').contains('Show only basic fields').should('be.visible');

      cy.get('[data-cy=specimen-form-sidebar]').contains('Show only basic fields').click();
      cy.get('#root_publicityRestrictions').should('not.exist');
      cy.get('[data-cy=specimen-form-sidebar]').contains('Show basic and advanced fields').should('be.visible');
    });

    it('should be able to choose advanced fields', () => {
      cy.get('[data-cy=mark-advanced-fields-button]').click();
      cy.get('#_laji-form_field_chooser_gatherings_0_units_0_recordParts').should('not.have.attr', 'aria-pressed');
      cy.get('#_laji-form_field_chooser_gatherings_0_units_0_recordParts').click();
      cy.get('#_laji-form_field_chooser_gatherings_0_units_0_recordParts').should('have.attr', 'aria-pressed', 'true');

      cy.get('[data-cy=mark-advanced-fields-button]').click();
      cy.get('#_laji-form_field_chooser_gatherings_0_units_0_recordParts').should('not.exist');

      cy.get('[data-cy=mark-advanced-fields-button]').click();
      cy.get('#_laji-form_field_chooser_gatherings_0_units_0_recordParts').should('have.attr', 'aria-pressed', 'true');
    });

    it('should be able to expand/collapse panels', () => {
      cy.get('#_laji-form_root_gatherings_0_units_0_primarySpecimen').should('be.visible');

      cy.get('[data-cy=collapse-all-button]').click();
      cy.get('#_laji-form_root_gatherings_0_units_0_primarySpecimen').should('not.exist')

      cy.get('[data-cy=expand-all-button]').click();
      cy.get('#_laji-form_root_gatherings_0_units_0_primarySpecimen').should('be.visible',);
    });
  });

  describe('basic functionality', () => {
    const testId = 'JX.653297435';
    const testTaxon = 'Parus major';

    before(() => {
      cy.removeTestDataIfExists('/specimens/search', [
        { colIndex: 1, value: testId }
      ]);
    });

    beforeEach(() => {
      cy.visit('/botany/specimens/add');
      cy.get('[data-cy=specimen-form-sidebar]', { timeout: 15000 }).should(
        'be.visible',
      );
    });

    it('should be possible to save, copy and delete document', () => {
      // fill data
      const idParts = testId.split('.');
      cy.get('#root_namespaceID').type(idParts[0]);
      cy.get('#root_objectID').type(idParts[1]);
      cy.get('#root_collectionID').type('test');
      cy.get('.rw-popup .rw-list-option').first().click();
      cy.get('#root_gatherings_0_country').type('Finland');
      cy.get('#root_gatherings_0_units_0_recordBasis').type(
        'Observation{enter}',
      );
      cy.get('#root_gatherings_0_units_0_identifications_0_taxon').type(
        testTaxon + '{enter}',
      );

      // submit form
      cy.get('[data-cy=form-submit]').click();
      cy.get('[data-cy=toast]', { timeout: 40000 })
        .should('be.visible')
        .should('contain.text', 'Save success!');
      cy.get('[data-cy=toast-close]').click();
      cy.get('[data-cy=main-header]').should('contain', 'Edit botany specimen');

      // copy
      cy.get('[data-cy=form-copy]').click();
      cy.get('[data-cy=main-header]').should('contain', 'Create new botany specimen');
      cy.get('#root_gatherings_0_units_0_identifications_0_taxon').should('have.value', testTaxon);

      cy.go('back');
      cy.get('[data-cy=confirm-ok]').click();

      // delete
      cy.get('[data-cy=form-delete]').click();
      cy.get('[data-cy=confirm-ok]').click();
      cy.get('[data-cy=toast]', { timeout: 10000 })
        .should('be.visible')
        .should('contain.text', 'Success!');
      cy.get('[data-cy=toast-close]').click();
      cy.url().should('equal', Cypress.config('baseUrl') + '/specimens/search');
    });
  });
});

