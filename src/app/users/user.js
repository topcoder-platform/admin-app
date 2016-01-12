'use strict';

var module = angular.module('supportAdminApp');

module.factory('User', ['$log', 'users.Constants', 'API_URL',
  function($log, $const, API_URL) {

    var User = function() {};
    
    
    User.prototype.statusDesc = function() {
      return $const.DICT_USER_STATUS[this.status];
    };
    
    User.prototype.createdAtLabel = function() {
      return this.formatDate(this.createdAt);
    };
  
    User.prototype.modifiedAtLabel = function() {
      return this.formatDate(this.modifiedAt);
    };
    
    User.prototype.formatDate = function(isoDateText) {
      return isoDateText && isoDateText.replace("T"," ").replace(".000Z","");
    };
  
    /**
    * create an activation link from an activation code.
    */
    User.prototype.getActivationLink = function() {
      if(!this.credential || !this.credential.activationCode)
        return '';
      return API_URL + '/pub/activation.html?code=' + this.credential.activationCode + '&retUrl=https%3A%2F%2Fwww.topcoder.com%2Fskill-picker%2F';
    };
  
    return User;
  }
]);


