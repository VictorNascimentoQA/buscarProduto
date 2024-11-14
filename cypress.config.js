const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
  viewportWidth: 1280,  // Largura da tela
  viewportHeight: 1024, // Altura da tela
  e2e: {
    baseUrl: "https://www.amazon.com.br",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
