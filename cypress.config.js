module.exports = {

  videoCompression: false,
  e2e: {

    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1,
      openMode: 1,
      },
      screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
