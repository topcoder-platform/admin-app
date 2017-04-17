'use strict';

var paths = require('./.yo-rc.json')['generator-gulp-angular'].props.paths;

// An example configuration file.
exports.config = {

  // Capabilities to be passed to the webdriver instance.

  capabilities: {
    'browserName': 'chrome'
  },

  onPrepare: function() {
    // check if env variables for testing are set
    if (typeof process.env.TEST_USER === "undefined" || typeof process.env.TEST_PASSWORD === "undefined") {
        throw "The environment variables TEST_USER and TEST_PASSWORD should be set in order for the tests to work";
    }
  },

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: [paths.e2e + '/**/*.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
