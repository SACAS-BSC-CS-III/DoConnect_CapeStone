Cypress.Commands.add('login', (username, password) => {
  const api = Cypress.env('API_URL') || 'http://localhost:5109';
  cy.request('POST', `${api}/api/auth/login`, {
    username,
    password
  }).then((resp) => {
    window.localStorage.setItem('token', resp.body.token);
  });
});
