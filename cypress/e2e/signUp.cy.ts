describe('Register user', () => {
  it('Registers a User Failure', () => {
    cy.viewport(1600, 854);
    cy.visit('http://localhost:8080');

    cy.get('ion-content').should('be.visible');
    cy.get('ion-header ion-button').eq(1).click({force: true});

    cy.get('#ion-input-0').click({force: true}).type("123@gmail.com", {force: true});
    cy.get('#ion-input-1').click({force: true}).type("12345", {force: true});
    cy.get('#ion-input-2').click({force: true}).type("123", {force: true});
    cy.get('.button-centerer1').click({force: true});
    cy.get('.invalid-feedback').contains('Passwords do not match!.');

  })

  it('Registers a User Success', () => {
    cy.viewport(1600, 854);
    cy.visit('http://localhost:8080');

    cy.get('ion-content').should('be.visible');
    cy.get('ion-header ion-button').eq(1).click({force: true});

    cy.get('#ion-input-0').click({force: true}).type("123@gmail.com", {force: true});
    cy.get('#ion-input-1').click({force: true}).type("12345", {force: true});
    cy.get('#ion-input-2').click({force: true}).type("12345", {force: true});
    cy.get('.button-centerer1').click({force: true});

  })





})