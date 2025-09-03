describe('Auth Flow', () => {
  it('should register and login user', () => {
    cy.visit('http://localhost:4200/register');

    cy.get('input[formControlName="username"]').type('newuser');
    cy.get('input[formControlName="email"]').type('newuser@test.com');
    cy.get('input[formControlName="password"]').type('123456'); // ✅ min 6 chars

    cy.get('button[type="submit"]').should('not.be.disabled').click(); // ✅ wait until enabled

    cy.visit('http://localhost:4200/login');
    cy.get('input[formControlName="username"]').type('newuser');
    cy.get('input[formControlName="password"]').type('123456');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/questions');
  });
});
