/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var LoginPage = function() {
  /*this.jumbEl = element(by.css('.jumbotron'));
  this.h1El = this.jumbEl.element(by.css('h1'));
  this.imgEl = this.jumbEl.element(by.css('img'));
  this.thumbnailEls = element(by.css('body')).all(by.repeater('awesomeThing in awesomeThings'));*/
  this.loginForm = element(by.css('form'));
  this.loginHeader = this.loginForm.element(by.css('h3'));
  const inputs = this.loginForm.all(by.css('input'));
  this.usernameInput = inputs.get(0);
  this.passwordInput = inputs.get(1);
  this.loginButton = this.loginForm.element(by.css('button'));
  this.alerts = element(by.css('body')).all(by.repeater('alert in alerts'));
};

module.exports = new LoginPage();
