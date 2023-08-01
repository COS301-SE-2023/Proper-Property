describe('Home page', () => {

  beforeEach(() => {
    cy.viewport(1600, 854);
    cy.visit('http://localhost:8080');
    //cy.intercept('http://localhost:8080');
    cy.location('pathname').then((current) => {

    });

  });

  /** Navabar Test **/
  it('Should have navbar and  mark the active page', () => {
    cy.get('ion-header ion-button').should('have.length', '4');
    cy.get('ion-header ion-button').eq(2).should('have.class', 'active');
   
  })

  // /** First Section Test */
  it('It should display Proper Property Home Screen Content', () => {    
    cy.get('ion-content').should('be.visible');
    cy.contains("Proper Properties");
    cy.contains("For You");
    
    cy.contains("What makes us Unique");
    cy.contains("Top features");

  })

  it('Contains Search Bar', () => {
    cy.get('#address').should('be.visible');
    cy.wait(150);
    cy.get('#address').click({force: true}).type('Pretoria', {force: true});
    cy.get('ion-button').contains('Search').should('be.visible');
    cy.wait(150);
    cy.get('#search-button').click({ force: true });
    cy.url().should('include', '/search?q=');
    
  });

 

})