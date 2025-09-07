describe('Auth Flow', () => {
  it('should register and login user', () => {
    cy.visit('/register');

    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="email"]').type('test@test.com');
    cy.get('input[formControlName="password"]').type('Test@123');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/login');

    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/questions');
  });
});
