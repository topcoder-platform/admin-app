'use strict';

describe('The dashboard view', function () {
  var mainPage;
  var testPort = process.env.TEST_PORT || 3000;

  beforeEach(function () {
    browser.get('http://localhost:' + testPort + '/');
    mainPage = require('./main.po');
  });
});
