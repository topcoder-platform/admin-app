'use strict';

describe('Check Login Page', function () {

   beforeEach(function() {
   browser.get('http://localhost:3000/#/login');
   });
   
   //Login Page title validation
   it('should have a title', function() {
    expect(browser.getTitle()).toEqual('Topcoder Platform - Support App');
  });
  
   //Check the userName input
   it('userName should be accessible', function() {
     var username = element(by.model('formLogin.username'));

     username.clear();
     expect(username.getAttribute("value")).toEqual('');
     
     username.sendKeys('testUser');
	 
     expect(username.getAttribute("value")).toEqual('testUser');
   });
   
   //After wrong login it should stay in same page
   it('should stay in same page for wrong login', function() {
     var username = element(by.model('formLogin.username'));
	 var password = element(by.model('formLogin.password'));
     var loginButton = element( by.css('[ng-click="login()"]'));
	 
     username.sendKeys('dummy');
	 password.sendKeys('dummy');
	 
	 loginButton.click();
	  
     expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/login');
   });
   
   //After successful login it should move to user page
   it('should move to users page for correct login', function() {
     var username = element(by.model('formLogin.username'));
	 var password = element(by.model('formLogin.password'));
     var loginButton = element( by.css('[ng-click="login()"]'));
	 
     username.sendKeys('amy_admin');
	 password.sendKeys('topcoder1');
	 
	 loginButton.click();
	  
     expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/#/index/users');
   });

});
