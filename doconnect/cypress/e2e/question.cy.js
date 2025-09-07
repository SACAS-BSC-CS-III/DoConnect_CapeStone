describe('Question Flow', () => {
  beforeEach(() => {
    // custom login command ensures token in localStorage
    cy.login('testuser', 'Test@123');
  });

  it('should allow user to ask a question', () => {
    cy.visit('/ask');

    cy.get('input[formControlName="title"]').type('What is Dependency Injection?');
    cy.get('textarea[formControlName="body"]').type('Please explain with example.');

    cy.intercept('POST', '**/api/questions').as('createQuestion');
    cy.get('button[type="submit"]').click();

    // wait for backend to confirm question creation
    cy.wait('@createQuestion').its('response.statusCode').should('eq', 201);

    // after creation, redirect back to questions
    cy.url().should('include', '/questions');
  });

  it('should display question in list after admin approval', () => {
  // first, login as admin to get token
  cy.request('POST', 'http://localhost:5109/api/auth/login', {
    username: 'admin',
    password: 'Admin@123'
  }).then((res) => {
    const token = res.body.token;

    // approve the question using admin token
    cy.request({
      method: 'POST',
      url: 'http://localhost:5109/api/admin/questions/1/approve?approve=true',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {}
    }).then((approveRes) => {
      expect(approveRes.status).to.eq(204);
    });
  });

  // now check the question list
  cy.visit('/questions');
  cy.contains('What is Dependency Injection?').should('exist');
});
});