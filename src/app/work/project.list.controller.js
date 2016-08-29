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

          // For the loaded project objects this function does:
          // 1. Queries user email and handles for ids of all projects' copilots
          //    and owners. The queries are send in batches of size equal to
          //    MAX_BATCH_SIZE ids per query.
          // 2. If 'vm.formSearch.filterByHandleOrEmail' is true, it filters
          //    loaded project object by handle and emails;
          // 3. Redraws the table.

          function (projects) {

            var MAX_BATCH_SIZE = 100;

            // Collects copilot and owner's ids from the loaded project objects.
            // The resulting 'queue' array will hold unique user ids to be
            // be queried from the MembersService in several batches, and
            // the 'users' dictionary will be prepared to collect queiried data.
            var queue = [], collect = function (users, userId) {
              if (!isNaN(userId) && !users[userId]) {
                users[userId] = { email: '', handle: ''};
                queue.push(userId);
              }
            };
            var users = projects.reduce(function(users, project) {

              // Ids should be trimmed, as in the production data some of them
              // may include spaces before and after, which breaks matching of
              // ids width handles.
              if (project.copilotId) {
                project.copilotId = project.copilotId.trim();
              }
              if (project.ownerId) {
                project.ownerId = project.ownerId.trim();
              }

              collect(users, project.copilotId);
              collect(users, project.ownerId);
              return users;
            }, {});
  
            // Now we send queries to MembersService in batches.
            // The MAX_BATCH_SIZE constant sets the maximal batch size
            // (i.e. the number of ids in a single query).
            var pos = 0, queryNextBatch = function() {
              var query = '';
              var end = Math.min(pos + MAX_BATCH_SIZE, queue.length);
              for (var i = pos; i < end; ++i) {
                query += 'userId:' + queue[i] + ' OR ';
              }
              membersService.search({
                search: query.slice(0, -4)
              }).then(
                function (userObjects) {
                  pos += MAX_BATCH_SIZE;
                  userObjects.forEach(function(user) {
                    users[user.userId] = {
                      email: user.email,
                      handle: user.handle
                    };
                  });
                  if (pos < queue.length) {
                    queryNextBatch();
                  } else {
                    finalize();
                  }
                },
                function (error) {
                  finalize();
                }
              );
            };

            // Once all necessary data have been queried, this function
            // will be used to attach the queried user data to the loaded
            // project object, and to redraw the table.
            var finalize = function() {
              
              projects.forEach(function(project) {
                project.copilot = users[project.copilotId];
                project.owner = users[project.ownerId];
              });

              // If asked, filters the projects by owner's handle and
              // and email (remaining projects will contain
              // 'vm.formSearch.handleOrEmail' as a substring
              // of their owner's handle or email).
              if (vm.formSearch.filterByHandleOrEmail) {
                vm.formSearch.filterByHandleOrEmail = false;
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
              }

              vm.allProjects  = projects;
              $scope.projects = projects;
              vm.formSearch.isLoading   = false;
              $('.table').trigger('footable_redraw');
            };
            
            queryNextBatch();
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
      vm.formSearch.filterByHandleOrEmail = true;
      vm.formSearch.search = '';
      vm.formSearch.status = ALL;
      vm.findProjects();
    };

    // initialization
    angular.element(document).ready(function () {
      vm.findProjects();
    });

    return this;
  }]);
