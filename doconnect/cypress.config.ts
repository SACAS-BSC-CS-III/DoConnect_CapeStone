const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    chromeWebSecurity: false,
    video: false,
    env: {
      API_URL: 'http://localhost:5109'  
    }
  },
});
