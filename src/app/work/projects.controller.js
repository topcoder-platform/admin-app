'use strict';

var module = angular.module('supportAdminApp');

module.controller('ProjectListCtrl', [
  '$scope', '$rootScope', '$timeout', 'AuthService', 'Alert', 'ProjectService',
  function ($scope, $rootScope, $timeout, $authService, $alert, projectSvc) {
    // preferable hold variable to watch in controller
    var vm = this;

    // use $scope for projects to display,
    // because of footable bug not displaying rows properly
    $scope.projects = [];

    // only different enum value that requires different filtering logic
    var ALL = 'All';

    // enum for statuses, there may be more statuses because I only used sample data from co-pilot
    $scope.statuses = [
      'ALL',
      'INCOMPLETE',
      'SUBMITTED',
      'ESTIMATED',
      'LAUNCHED',
      'ASSIGNED',
      'APPROVED'
    ];

    /**
     * Check if user is logged in
     */
    vm.authorized = function () {
      return $authService.isLoggedIn();
    };

    // VM variables for searching.
    vm.formSearch = {
      search: '',
      status: ALL,
      isLoading: false
    };

    // VM variables that hold all projects
    vm.allProjects = [];

    /**
     * findProjects find projects that match criteria
     *   by delegate project service
     */
    vm.findProjects = function () {
      // clear previous state
      $scope.$broadcast('alert.ClearAll', {});
      $scope.projects.length = 0;

      vm.formSearch.isLoading = true;
      // search
      projectSvc.search({
        search: vm.formSearch.search,
        status: vm.formSearch.status === ALL ? '' : vm.formSearch.status
      }).then(
          function (projects) {
            // display
            vm.allProjects = projects;
            $scope.projects = vm.allProjects;
            $timeout(function () {
              vm.formSearch.isLoading = false;
              $('.table').trigger('footable_redraw');
            }, 500);
          },
          function (error) {
            // error handling
            console.log('error:', error);
            vm.formSearch.isLoading = false;

            $scope.$broadcast('alert.AlertIssued', {
              type: 'danger',
              message: error.error || 'Error: Cannot Fetch Projects'
            });
          }
        );
    };

    // initialization
    angular.element(document).ready(function () {
      vm.findProjects();
    });

    return this;
  }]);
