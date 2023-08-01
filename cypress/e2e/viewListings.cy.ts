describe('View Listings', () => {
  it('Navigate to View Listing', () => {
    cy.viewport(1600, 854);
    cy.visit('http://localhost:8080');

    cy.get('ion-content').should('be.visible');
    cy.get('ion-header ion-button').eq(3).click({force: true});
    cy.get('ion-header ion-button').eq(3).should('have.class', 'active');
    
  })
})