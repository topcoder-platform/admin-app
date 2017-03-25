'use strict';

describe('The login view', function () {
  var page;
  var mainPage;

  beforeEach(function () {
    browser.get('http://localhost:3000/');
    page = require('./login.po');
    mainPage = require('./main.po');
  });

  it('should display the correct form heading', function() {
    expect(page.loginHeader.getText()).toBe('ADMIN APP LOGIN');
    //expect(page.imgEl.getAttribute('src')).toMatch(/assets\/images\/yeoman.png$/);
    //expect(page.imgEl.getAttribute('alt')).toBe('I\'m Yeoman');
  });

  it('login should fail for wrong credentials', function () {
    //expect(page.thumbnailEls.count()).toBeGreaterThan(5);
    page.usernameInput.sendKeys('wrong');
    page.passwordInput.sendKeys('wrong');
    page.loginButton.click();
    expect(page.alerts.count()).toBe(1);
    expect(page.alerts.get(0).getText()).toBe('Wrong username or password.');
  });

  it('login should succeed for correct credentials', function () {
    //expect(page.thumbnailEls.count()).toBeGreaterThan(5);
    page.usernameInput.sendKeys('amy_admin');
    page.passwordInput.sendKeys('topcoder1');
    page.loginButton.click();
    expect(mainPage.isUserLoggedIn.isDisplayed()).toBeTruthy();
    expect(mainPage.loggedInUser.getText()).toBe('amy_admin');
  });

  it('logout should work after login', function () {
    //expect(page.thumbnailEls.count()).toBeGreaterThan(5);
    page.usernameInput.sendKeys('amy_admin');
    page.passwordInput.sendKeys('topcoder1');
    page.loginButton.click();
    expect(mainPage.isUserLoggedIn.isDisplayed()).toBeTruthy();
    expect(mainPage.loggedInUser.getText()).toBe('amy_admin');
    mainPage.logout.click();
    expect(page.loginHeader.getText()).toBe('ADMIN APP LOGIN');
  });

});
