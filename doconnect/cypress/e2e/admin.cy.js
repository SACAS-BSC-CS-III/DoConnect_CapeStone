// cypress/e2e/admin.cy.js
// Simple, UI-first admin tests (no tricky API payloads)

function loginViaUI(username, password) {
  cy.visit('/login');

  cy.intercept('POST', '**/api/auth/login').as('login');

  cy.get('input[formControlName="username"]').clear().type(username);
  cy.get('input[formControlName="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();

  // wait for backend to reply
  cy.wait('@login').then(({ response }) => {
    expect(response?.statusCode).to.eq(200);

    const token = response?.body?.token;
    expect(token, 'JWT present').to.be.a('string').and.not.be.empty;

    // ensure token is really in localStorage (app should set it; we double-ensure)
    cy.window().then((win) => {
      if (!win.localStorage.getItem('token')) {
        win.localStorage.setItem('token', token);
      }
    });
  });

  // app redirects after login; accept either page
  cy.url().should('match', /\/(questions|admin)\b/);
}

function logoutViaUI() {
  cy.get('button').contains('Logout').click({ force: true });
}

describe('Admin Flow (UI-first)', () => {
  it('approves a pending question created by a user', () => {
    const title = 'AdminTestQuestion2';
    const body = 'Question to be approved by admin';

    // 1) User creates a question (via UI)
    loginViaUI('testuser', 'Test@123');
    
    cy.visit('/ask');
    cy.get('input[formControlName="title"]').type(title);
    cy.get('textarea[formControlName="body"]').type(body);

    cy.intercept('POST', '**/api/questions').as('createQ');
    cy.get('button[type="submit"]').click();
    cy.wait('@createQ').its('response.statusCode').should('be.oneOf', [201, 200]);

    // Optional sanity: redirected to questions list
    cy.url().should('include', '/questions');

    // Logout user
    logoutViaUI();

    // 2) Admin approves it (via UI)
    loginViaUI('admin', 'Admin@123');
    // If your app auto-redirects admin to /admin, great; otherwise:
    cy.visit('/admin');

    // Wait for pending data to load
    cy.intercept('GET', '**/api/admin/pending').as('getPending');
    cy.wait('@getPending' , {timeout:15000}).its('response.statusCode').should('eq', 200);

    // Find this specific question by title and approve
    cy.contains('.item p', title)
      .parents('.item')
      .within(() => {
        cy.contains('Approve').click();
      });

    // Verify it disappears from the pending list
    cy.contains('.item p', title).should('not.exist');
  });

  it('rejects a pending question created by a user', () => {
    const title = 'AdminRejectQuestion';
    const body = 'Question to be rejected by admin';

    // Create as user
    loginViaUI('testuser', 'Test@123');
    cy.visit('/ask');
    cy.get('input[formControlName="title"]').type(title);
    cy.get('textarea[formControlName="body"]').type(body);

    cy.intercept('POST', '**/api/questions').as('createQ');
    cy.get('button[type="submit"]').click();
    cy.wait('@createQ').its('response.statusCode').should('be.oneOf', [201, 200]);
    logoutViaUI();

    // Reject as admin
    loginViaUI('admin', 'Admin@123');
    cy.visit('/admin');
    cy.intercept('GET', '**/api/admin/pending').as('getPending');
    cy.wait('@getPending');

    cy.contains('.item p', title)
    .closest('.item')
    .within(() => {
      cy.contains('button', 'Reject').click();
    });


    cy.contains('.item p', title).should('not.exist');
  });

  it('deletes a pending question created by a user', () => {
    const title = 'AdminDeleteQuestion';
    const body = 'Question to be deleted by admin';

    // Create as user
    loginViaUI('testuser', 'Test@123');
    cy.visit('/ask');
    cy.get('input[formControlName="title"]').type(title);
    cy.get('textarea[formControlName="body"]').type(body);

    cy.intercept('POST', '**/api/questions').as('createQ');
    cy.get('button[type="submit"]').click();
    cy.wait('@createQ').its('response.statusCode').should('be.oneOf', [201, 200]);
    logoutViaUI();

    // Delete as admin
    loginViaUI('admin', 'Admin@123');
    cy.visit('/admin');
    cy.intercept('GET', '**/api/admin/pending').as('getPending');
    cy.wait('@getPending');

    cy.contains('.item p', title)
      .parents('.item')
      .within(() => {
        cy.contains('button','Delete').click();
      });

    cy.contains('.item p', title).should('not.exist');
  });

  it('approves a pending answer created by a user', () => {
    const qTitle = 'AdminTestQuestion';
    const qBody = 'Question for admin answer approval';
    const answerText = 'This is a pending answer to be approved';

    // 1) User creates a question
    loginViaUI('testuser', 'Test@123');
    cy.visit('/ask');
    cy.get('input[formControlName="title"]').type(qTitle);
    cy.get('textarea[formControlName="body"]').type(qBody);

    cy.intercept('POST', '**/api/questions').as('createQ');
    cy.get('button[type="submit"]').click();
    cy.wait('@createQ');

    logoutViaUI();

    // 2) Admin approves it (via UI)
    loginViaUI('admin', 'Admin@123');
    // If your app auto-redirects admin to /admin, great; otherwise:
    cy.visit('/admin');

    // Wait for pending data to load
    cy.intercept('GET', '**/api/admin/pending').as('getPending');
    cy.wait('@getPending' , {timeout:15000}).its('response.statusCode').should('eq', 200);

    // Find this specific question by title and approve
    cy.contains('.item p', qTitle)
      .parents('.item')
      .within(() => {
        cy.contains('button','Approve').click();
      });

    logoutViaUI();

    loginViaUI('testuser', 'Test@123');
    cy.visit('/ask');
    cy.get('input[formControlName="title"]').type(qTitle);
    cy.get('textarea[formControlName="body"]').type(qBody);

    // 2) User navigates to the question and adds an answer (pending)
    cy.visit('/questions');
    cy.contains(qTitle).click();
    cy.url().should('include', '/questions/');
    cy.get('a.answer-link').click();

    cy.intercept('POST', '**/api/questions/*/answers').as('postAnswer');
    cy.get('textarea[formControlName="body"]').type(answerText);
    cy.get('button[type="submit"]').click();
    cy.wait('@postAnswer').its('response.statusCode').should('be.oneOf', [201, 200]);

    // logout user
    logoutViaUI();

    // 3) Admin approves the pending answer
    loginViaUI('admin', 'Admin@123');
    cy.visit('/admin');
    cy.intercept('GET', '**/api/admin/pending').as('getPending');
    cy.wait('@getPending');

    cy.contains('.item p', answerText)
      .parents('.item')
      .within(() => {
        cy.contains('button','Approve').click();
      });

    cy.contains('.item p', answerText).should('not.exist');
  });
});
