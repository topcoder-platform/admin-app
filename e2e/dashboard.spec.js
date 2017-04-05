'use strict';

describe('The dashboard view', function () {
  var page;
  var mainPage;

  beforeEach(function () {
    browser.get('http://localhost:3000/');
    page = require('./login.po');
    mainPage = require('./main.po');
    page.usernameInput.sendKeys('amy_admin');
    page.passwordInput.sendKeys('topcoder1');
    page.loginButton.click();
  });

  it('should find members', function() {
    mainPage.searchHandleInput.sendKeys('sah2ed');
    mainPage.searchButton.click();
    expect(mainPage.users.count()).toBe(1);
    expect(mainPage.users.get(0).element(by.cssContainingText('td', 'sah2ed')).getText()).toBe('sah2ed');
  });
});
