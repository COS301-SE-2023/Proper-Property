describe('Home page', {defaultCommandTimeout: 1000}, () => {

  beforeEach(() => {
    cy.viewport(1000, 600);
    // cy.visit('http://localhost:4200');
    //cy.intercept('http://localhost:4200');

  });
  it('Page should contain "profile"', () => {
    cy.visit('/home')
      .wait(100)
      .contains('Profile',{matchCase: false});
  });
  /** Navabar Test **/
  it('Should have navbar and  mark the active page', () => {
    cy.visit('/home')
      .wait(100)
      .get('.navlink')
      .should('have.length', '6')
      .eq(2)
      .should('have.class', 'active');
   
    cy.visit('/login')
      .wait(100)
      .get('.navlink')
      .eq(0)
      .should('have.class', 'active');

    cy.visit('/register')
      .wait(100)
      .get('.navlink')
      .eq(1)
      .should('have.class', 'active');

    cy.visit('/create-listing')
      .wait(100)
      .get('.navlink')
      .eq(3)
      .should('have.class', 'active');

    cy.visit('/listings')
      .wait(100)
      .get('.navlink')
      .eq(4)
      .should('have.class', 'active');

    cy.visit('/profile')
      .wait(100)
      .get('.navlink')
      .eq(5)
      .should('have.class', 'active');
  })

  /** First Section Test */
  it('It should display Proper Property Home Screen Content', () => {   
    cy.visit('/home')
      .wait(100)
      .get('.slogan')
      .should('be.visible')
      .contains("Proper")
      .contains("Properties");
    cy.get('.slogan')
      .contains("For You");
    
   // cy.contains("What makes it Unique");
    //cy.contains("Top features");

  })

  it('Contains Search Bar', () => {
    cy.visit('/home')
      .wait(100)
      .get(".custom-searchbar")
      .should('be.visible');
    //will continue after searchbar is working
  });

})