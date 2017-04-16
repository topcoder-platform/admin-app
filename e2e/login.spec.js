'use strict';

describe('The login view', function () {
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
    page.usernameInput.sendKeys(testUser);
    page.passwordInput.sendKeys(testPassword);
    page.loginButton.click();
    expect(mainPage.isUserLoggedIn.isDisplayed()).toBeTruthy();
    expect(mainPage.loggedInUser.getText()).toBe(testUser);
  });

  it('logout should work after login', function () {
    //expect(page.thumbnailEls.count()).toBeGreaterThan(5);
    page.usernameInput.sendKeys(testUser);
    page.passwordInput.sendKeys(testPassword);
    page.loginButton.click();
    expect(mainPage.isUserLoggedIn.isDisplayed()).toBeTruthy();
    expect(mainPage.loggedInUser.getText()).toBe(testUser);
    mainPage.logout.click();
    expect(page.loginHeader.getText()).toBe('ADMIN APP LOGIN');
  });

});
