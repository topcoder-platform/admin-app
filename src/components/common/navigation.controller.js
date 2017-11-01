'use strict';

angular.module('supportAdminApp')
  .controller('NavController', ['$scope', '$state', 
  function ($scope, $state) {
    $scope.$state = $state;

    $scope.forceStateProjects = function () {
      $state.go('index.projects');
    };
    
    // Add menu toggle function for mobile
    $scope.menuList = false;
    $scope.menuOpen = function() {
      $scope.menuList = !$scope.menuList;
    }

    // Click menu item go to another page will close the menu as well
    angular.element(document.querySelectorAll("a[ui-sref]")).bind('click', $scope.menuOpen);
}]);
