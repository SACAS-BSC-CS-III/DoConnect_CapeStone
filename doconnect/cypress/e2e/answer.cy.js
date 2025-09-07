describe('Answer Flow', () => {
  beforeEach(() => {
    cy.login('testuser', 'Test@123'); // custom command sets token
  });

  it('should allow user to answer a question', () => {
    // 1. Go to questions list
    cy.visit('/questions');

    // 2. Click on the Dependency Injection question
    cy.contains('What is Dependency Injection?').click();

    // 3. Should land on detail page
    cy.url().should('include', '/questions/');

    // 4. Click "Add Answer" link
    cy.get('a.answer-link').click();

    // 5. Submit an answer
    cy.intercept('POST', '**/api/questions/*/answers').as('postAnswer');
    cy.get('textarea[formControlName="body"]').type('DI is a design pattern in Angular and .NET.');
    cy.get('button[type="submit"]').click();

    // 6. Verify API response
    cy.wait('@postAnswer').its('response.statusCode').should('eq', 201);

    // 7. Should still be pending until admin approves
    cy.contains('No answers yet').should('exist');
  });

  it('should display answer after admin approval', () => {
    // login as admin and approve
    cy.request('POST', 'http://localhost:5109/api/auth/login', {
      username: 'admin',
      password: 'Admin@123'
    }).then((res) => {
      const token = res.body.token;

      // approve latest answer (adjust ID if needed)
      cy.request({
        method: 'POST',
        url: 'http://localhost:5109/api/admin/answers/1/approve?approve=true',
        headers: { Authorization: `Bearer ${token}` },
        body: {}
      }).its('status').should('eq', 204);
    });

    // now user should see it in the question detail page
    cy.visit('/questions');
    cy.contains('What is Dependency Injection?').click();
    cy.contains('DI is a design pattern in Angular and .NET.').should('exist');
  });
});
