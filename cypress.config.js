module.exports = {

  videoCompression: false,
  e2e: {

    defaultCommandTimeout: 4000,
    retries: {
      runMode: 1,
      openMode: 4,
      },
      screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
