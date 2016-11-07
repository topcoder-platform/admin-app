'use strict';

var module = angular.module('supportAdminApp');

module.constant('admintool.Constants', {
  // excluding challenge categories for reviewer role must use lower case
  ExcludeCategories: [angular.lowercase('Copilot Posting'), angular.lowercase('Other'), angular.lowercase('Studio Other')],
  Roles: {
    Admin: 'Admin',
    Copilot: 'Copilot',
    Reviewer: 'Reviewer',
  }
});
