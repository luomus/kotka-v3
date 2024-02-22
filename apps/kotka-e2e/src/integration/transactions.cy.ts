describe('transactions', () => {
  beforeEach(() => {
    cy.setUserAsLoggedIn();
    cy.visit('/transactions');
  });

  describe('transaction table', () => {
    it('should be able to add a column', () => {
      cy.get('.ag-header-row-column .ag-header-cell').should('have.length', 3);
      cy.get('[data-cy=select-columns]').click();
      cy.get('.ag-selection-checkbox').eq(3).click();
      cy.get('[data-cy=confirm-ok]').click();
      cy.get('.ag-header-row-column .ag-header-cell').should('have.length', 4);
    });
  });

  describe('transaction form', () => {
    beforeEach(() => {
      cy.get('#transactions-menu').click();
      cy.get('[data-cy=transactions-add]').click();
      cy.get('#root_type', { timeout: 10000 }).should('be.visible');
    });

    it('should hide fields before a type is selected', () => {
      cy.get('#root_material').should('not.exist');
    });

    it('should show fields when a type is selected', () => {
      cy.get('#root_type').type('Loan, incoming{enter}');
      cy.get('#root_material').should('be.visible');
    });

    describe('content', () => {
      beforeEach(() => {
        cy.get('#root_type').type('Loan, incoming{enter}');
      });

      it('should always show correct country links', () => {
        cy.get('#root_geneticResourceAcquisitionCountry').type('Finland{enter}');
        cy.get('[data-cy=permits-info] ul').children()
          .should('have.length.greaterThan', 1)
          .should('contain.text', 'Finnish Environment Institute');

        cy.get('#root_geneticResourceAcquisitionCountry input').clear();
        cy.get('[data-cy=permits-info] ul').should('not.exist');

        cy.get('#root_geneticResourceAcquisitionCountry').type('Sweden{enter}');
        cy.get('[data-cy=permits-info] ul').children()
          .should('have.length.greaterThan', 1)
          .should('not.contain.text', 'Finnish Environment Institute')
          .should('contain.text', 'The Swedish Environmental Protection Agency');

        cy.get('#root_type input').clear();
        cy.get('[data-cy=permits-info]').should('not.exist');
        cy.get('#root_type').type('Loan, incoming{enter}');
        cy.get('[data-cy=permits-info] ul').children()
          .should('have.length.greaterThan', 1)
          .should('contain.text', 'The Swedish Environmental Protection Agency');
      });

      it('should be possible to add specimens by a range', () => {
        cy.get('[data-cy=specimen-range-input]').type('HT.120-300');
        cy.get('[data-cy=specimen-range-button]').click();

        cy.get('#root_awayIDs').siblings('.rw-multiselect-taglist').children()
          .should('have.length.greaterThan', 0)
          .should('contain.text', 'http://id.luomus.fi/HT.123');
      });

      it('should open a modal when clicking the add transaction event button', () => {
        cy.get('#root_transactionEvents-add').click();
        cy.get('.transaction-event-modal').should('be.visible');
      });

      it('should add a transaction event', () => {
        cy.get('#root_transactionEvents-add').click();

        cy.get('#root_eventType').type('Return{enter}');
        cy.get('.transaction-event-modal .date-widget input').type('01/01/2020{enter}');
        cy.get('#root_eventNotes').type('abcdef');
        cy.get('[data-cy=confirm-ok]').click();

        cy.get('.transaction-event-modal').should('not.be.visible');
        cy.get('#root_transactionEvents_0_eventNotes').should('contain', 'abcdef');
      });
    });
  });
});
