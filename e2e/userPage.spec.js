'use strict';

describe('Check User Page', function () {

   //Login using admin user before proceeding
   browser.get('http://localhost:3000/#/login');
   
   var username = element(by.model('formLogin.username'));
   var password = element(by.model('formLogin.password'));
   var loginButton = element( by.css('[ng-click="login()"]'));
	 
   username.sendKeys('amy_admin');
   password.sendKeys('topcoder1');
	 
   loginButton.click();

   it('should move to dashboard page', function() {
    var dashboard = element(by.linkText('Dashboard'));
    dashboard.click();	
	 
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/index/main');
   });   
   
   it('should move to Admin page', function() {
    var client = element(by.css('[ui-sref="index.admintool"]'));
    client.click();	
	 
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/index/admintool');
   });  
   
   it('should move to Import SSO Users page', function() {
    var bact = element(by.css('[ui-sref="index.sso"]'));
    bact.click();	
	 
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/index/sso');
   });  
   
   it('should move to Submissions page', function() {
    var submission = element(by.linkText('Submissions'));
    submission.click();	
	 
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/index/submissions/list');
   });  
   
   it('should move to Import Users page', function() {
    var tags = element(by.css('[ui-sref="index.addmembers"]'));
    tags.click();	
	 
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/index/add');
   });
   
   it('should move to login page after log out', function() {
    var logoutButton = element( by.css('[ng-click="logout()"]'));
    logoutButton.click();	
	 
    expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/login');
   });  

});
