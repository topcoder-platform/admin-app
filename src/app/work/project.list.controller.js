/*
 * The Project Lists Controller exposes projects in the database,
 * and allows to search them.
 *
 * (C) 2016 TopCoder. All Rights Reserved.
 */

'use strict';

var module = angular.module('supportAdminApp');

module.controller('ProjectListCtrl', [
  '$scope', '$rootScope', '$timeout', 'AuthService', 'Alert', 'ProjectService',
  'MembersService',
  function ($scope, $rootScope, $timeout, $authService, $alert, projectSvc,
            membersService) {

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
      filterByHandleOrEmail: false,
      handleOrEmail: '',
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

            // Generates the query to search for members with 'usedId' specified
            // in 'ownerId' and 'copilotId' field of each project we have found.
            // The 'isNaN' check is necessary as 'copilotId' may be equal to
            // "unassigned", or some other string values.
            var query = projects.reduce(function(query, project) {
              if (!isNaN(project.ownerId))
                query += 'userId:' + project.ownerId + ' OR ';
              if (!isNaN(project.copilotId))
                query += 'userId:' + project.copilotId + ' OR ';
              return query;
            }, '').slice(0,-4);

            vm.allProjects = projects;
            $scope.projects = vm.allProjects;

            // Resolution of User IDs in the found project objects.
            membersService.search({
              search: query
            }).then(
              function (users) {

                // Uses the found 'users' array to add 'copilotHandle' and
                // 'ownerHandle' field to each project object.
                var map = users.reduce(function(map, user) {
                  map[user.userId] = user;
                  return map;
                }, {});
                projects.forEach(function(project) {
                  project.copilot = map[project.copilotId];
                  project.owner   = map[project.ownerId];
                });

                // If asked, filters the projects by owner's handle and
                // and email (remaining projects will contain
                // 'vm.formSearch.handleOrEmail' as a substring
                // of their owner's handle or email).
                if (vm.filterByHandleOrEmail) {
                  vm.filterByHandleOrEmail = false;
                  var key = vm.formSearch.handleOrEmail;
                  projects = projects.filter(function(project) {
                    var res = false;
                    res |= project.owner && project.owner.handle &&
                           project.owner.handle.includes(key);
                    res |= project.owner && project.owner.email &&
                           project.owner.email.includes(key);
                    res |= project.copilot && project.copilot.handle &&
                           project.copilot.handle.includes(key);
                    res |= project.copilot && project.copilot.email &&
                           project.copilot.email.includes(key);
                    return res;
                  });
                  vm.allProjects  = projects;
                  $scope.projects = projects;
                }
                $timeout(function () {
                  vm.formSearch.isLoading   = false;
                  $('.table').trigger('footable_redraw');
                }, 500);

              }, 
              function (error) {
  
                // Even in case of failure with the request to the Member
                // Service we still should update the page as the project's
                // data have been loaded (but not the user handles).

                $timeout(function () {
                  vm.formSearch.isLoading   = false;
                  $('.table').trigger('footable_redraw');
                }, 500);
              }
            );            
          },
          function (error) {
            // error handling
            console.log('error:', error);

            vm.filterByHandleOrEmail  = false;
            vm.formSearch.isLoading   = false;

            $scope.$broadcast('alert.AlertIssued', {
              type: 'danger',
              message: error.error || 'Error: Cannot Fetch Projects'
            });
          }
        );
    };
    
    /**
     * Searches projects by user handle or email address.
     * It just searches for all projects with the 'findProjects' function,
     * with an additionally activated 'handle or e-mail' filter.
     */
    vm.findByHandleOrEmail = function() {
      vm.filterByHandleOrEmail = true;
      vm.search = '';
      vm.status = ALL;
      vm.findProjects();
    };

    // initialization
    angular.element(document).ready(function () {
      vm.findProjects();
    });

    return this;
  }]);
