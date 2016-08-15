/*
 * The Project Controller exposes the data from
 * https://api-work.topcoder-dev.com/v3/projects/
 * for an individual project.
 *
 * (C) 2016 TopCoder. All Rights Reserved.
 */

'use strict';

var module = angular.module('supportAdminApp');

module.controller('projectController', ['$scope', '$stateParams',
                  'ProjectService',
                  function ($scope, $stateParams, $projectService) {

  /*
   * Holds the loaded project.
   */
  $scope.project = null;

  /*
   * Holds the project lookup state.
   */
  $scope.projectSearch = {
    id: '',
    isFound: false,
    isLoading: false,
  };

  /*
   * Captures the alear.ClearAll signal from the parent controller
   * (this signal is emitted when the user initiates a search of
   * a project from the 'Work API'), and triggers the search of
   * the same project via the 'Project API'.
   */
  $scope.$on('alert.ClearAll', function() {
    $scope.projectSearch.id = $scope.workSearch.workId;
    $scope.findProject();
  });

  /**
   * Converts ISO date string into the local human-readable string.
   * @param {String} date ISO date string.
   * @return Human-readable string.
   */
  $scope.fancyDate = function(date) {
    return new Date(date).toLocaleString();
  }

  /**
   * Finds the project by the id.
   * This function uses $scope.projectSearch to query the id, and to report
   * the state, and it assignes the found project object to $scope.project.
   */
  $scope.findProject = function () {
    $scope.$broadcast('alert.LookingForTheProject', {});
    $scope.projectSearch.isLoading = true;
    $scope.project = null;

    $projectService.findProjectById($scope.projectSearch.id).then(
      function (response) {
        $scope.projectSearch.isFound = true;
        $scope.projectSearch.isLoading = false;
        $scope.project = response;
      },
      function (error) {
        $scope.projectSearch.isFound = false;
        $scope.projectSearch.isLoading = false;
        $scope.project = null;
        var msg = error.status == 404 ? 'Project with ID ' +
                  $scope.projectSearch.id + ' not found!' :
                  error.error;
        $scope.$broadcast('alert.AlertIssued', {
          type: 'danger',
          message: msg
        });
      }
    );
  };

  /*
   * Initializes controller.
   */
  angular.element(document).ready(function() {
    if ($stateParams.id) {
      $scope.projectSearch.id = $stateParams.id;
      $scope.findProject();
    }
  });
}]);
