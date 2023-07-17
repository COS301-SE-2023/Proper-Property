describe('Login Page', () => {

  beforeEach(() => {
    cy.viewport(1600, 854);
    cy.visit('http://localhost:4200/login');
    //cy.intercept('http://localhost:4200/login');
    cy.location('pathname').then((current) => {
      if(current.includes('login')) {
    }});
  });

  it('Displays Content', () => {
    cy.get('ion-content').should('be.visible');
  });

  /** Navabar Test **/
  it('Should have navbar and  mark the active page', () => {
    cy.get('ion-header ion-button').should('have.length', '6');
    cy.get('ion-header ion-button').eq(0).should('have.class', 'active');
    
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
  });

  it('Contains Form', () => {
    cy.get('ion-list').should('be.visible');
    cy.get('ion-button').contains("Login").should('be.visible');
    cy.get('ion-button').contains("Sign in with Google").should('be.visible');
  });

  it('Contains Email Input field', () => {
    cy.get('ion-input[placeholder="  Email"]')
    .find('input')
    .should('have.attr', 'type', 'email');
  });

  it('Contains Password Input field', () => {
    cy.get('ion-input[placeholder="  Password"]')
    .find('input')
    .should('have.attr', 'type', 'password');
  });


})