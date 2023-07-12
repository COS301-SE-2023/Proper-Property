describe('Home page', {defaultCommandTimeout: 1000000}, () => {

  beforeEach(() => {
    cy.viewport(300, 300);
    // cy.visit('http://localhost:4200');
    //cy.intercept('http://localhost:4200');

  });
  it('Page should contain "profile"', () => {
    cy.visit('/home');
    cy.contains('Profile',{matchCase: false});
  });
  /** Navabar Test **/
  it('Should have navbar and  mark the active page', () => {
    cy.visit('/');
    cy.get('ion-header ion-button').should('have.length', '6');
    cy.get('ion-header ion-button').eq(2).should('have.class', 'active');
   
    cy.visit('/login');
    cy.get('ion-header ion-button').eq(0).should('have.class', 'active');

    cy.visit('/register');
    cy.get('ion-header ion-button').eq(1).should('have.class', 'active');

    cy.visit('/create-listing');
    cy.get('ion-header ion-button').eq(3).should('have.class', 'active');

    cy.visit('/listings');
    cy.get('ion-header ion-button').eq(4).should('have.class', 'active');

    cy.visit('/profile');
    cy.get('ion-header ion-button').eq(5).should('have.class', 'active');
  })

  /** First Section Test */
  it('It should display Proper Property Home Screen Content', () => {   
    cy.visit('/'); 
    cy.get('ion-content').should('be.visible');
    cy.contains("Proper Properties");
    cy.contains("For You");
    
   // cy.contains("What makes it Unique");
    //cy.contains("Top features");

  })

  it('Contains Search Bar', () => {
    cy.visit('/');
    cy.get('ion-searchbar').should('be.visible');
    //will continue after searchbar is working
  });

})