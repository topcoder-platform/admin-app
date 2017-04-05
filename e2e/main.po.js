/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var MainPage = function() {
  /*this.jumbEl = element(by.css('.jumbotron'));
  this.h1El = this.jumbEl.element(by.css('h1'));
  this.imgEl = this.jumbEl.element(by.css('img'));
  this.thumbnailEls = element(by.css('body')).all(by.repeater('awesomeThing in awesomeThings'));*/
  this.isUserLoggedIn = element(by.css('li[ng-show="authorized()"]'));
  this.loggedInUser = this.isUserLoggedIn.element(by.css('strong'));
  this.searchHandleInput = element(by.css('#search-condition-handle'));
  this.searchButton = element(by.css('button[ng-click="search()"]'));
  this.users = element(by.css('body')).all(by.repeater('user in users'));
  this.logout = element(by.css('a[ng-click="logout()"]'));
};

module.exports = new MainPage();
