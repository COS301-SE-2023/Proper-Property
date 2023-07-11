describe('Home page', () => {

  beforeEach(() => {
    cy.wait(800);
    cy.viewport(1600, 854);
    cy.visit('http://localhost:4200');
    //cy.intercept('http://localhost:4200');
    cy.location('pathname').then((current) => {
      if(current.includes('home')) {
       // cy.get('ion-tab-button').contains('Profile').click();
        //cy.get('ion-button').contains('Logout').click();
      }
    });

  });

  /** Navabar Test **/
  it('Should have navbar and  mark the active page', () => {
    cy.get('ion-header ion-button').should('have.length', '6');
    cy.get('ion-header ion-button').eq(2).should('have.class', 'active');
   
    cy.visit('http://localhost:4200/login');
    cy.get('ion-header ion-button').eq(0).should('have.class', 'active');

    cy.visit('http://localhost:4200/register');
    cy.get('ion-header ion-button').eq(1).should('have.class', 'active');

    cy.visit('http://localhost:4200/create-listing');
    cy.get('ion-header ion-button').eq(3).should('have.class', 'active');

    cy.visit('http://localhost:4200/listings');
    cy.get('ion-header ion-button').eq(4).should('have.class', 'active');

    cy.visit('http://localhost:4200/profile');
    cy.get('ion-header ion-button').eq(5).should('have.class', 'active');
  })

  /** First Section Test */
  it('It should display Proper Property Home Screen Content', () => {    
    cy.get('ion-content').should('be.visible');
    cy.contains("Proper Properties");
    cy.contains("For You");
    
   // cy.contains("What makes it Unique");
    //cy.contains("Top features");

  })

  it('Contains Search Bar', () => {
    cy.get('ion-searchbar').should('be.visible');
    //will continue after searchbar is working
  });

  it('Should work', () => {
    cy.contains("Proper Properties");
    cy.contains("For You");
  });

})