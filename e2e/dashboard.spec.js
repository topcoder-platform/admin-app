'use strict';

describe('The dashboard view', function () {
  var page;
  var mainPage;
  var testUser = process.env.TEST_USER;
  var testPassword = process.env.TEST_PASSWORD;
  var testPort = process.env.TEST_PORT || 3000;

  beforeEach(function () {
    browser.get('http://localhost:' + testPort + '/');
    page = require('./login.po');
    mainPage = require('./main.po');
  });

  it('should have environment variables defined', function(){
    expect(testUser).toBeDefined();
    expect(testPassword).toBeDefined();
  });

  it('should find members', function() {
    page.usernameInput.sendKeys(testUser);
    page.passwordInput.sendKeys(testPassword);
    page.loginButton.click();
    mainPage.searchHandleInput.sendKeys('sah2ed');
    mainPage.searchButton.click();
    expect(mainPage.users.count()).toBe(1);
    expect(mainPage.users.get(0).element(by.cssContainingText('td', 'sah2ed')).getText()).toBe('sah2ed');
  });
});
