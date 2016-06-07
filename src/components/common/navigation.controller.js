'use strict';

angular.module('supportAdminApp')
  .controller('NavController', ['$scope', '$state', 
  function ($scope, $state) {

    $scope.forceStateProjects = function () {
      $state.go('index.projects');
    };

}]);
