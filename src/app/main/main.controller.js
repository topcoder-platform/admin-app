'use strict';

angular.module('supportAdminApp')
  .controller('MainController', ['$scope', '$rootScope', '$timeout', '$state', 'AuthService',
  function ($scope, $rootScope, $timeout, $state, $authService) {

    $scope.logout = function() {
      $authService.logout();
      $state.go('login');
    };
}]);
