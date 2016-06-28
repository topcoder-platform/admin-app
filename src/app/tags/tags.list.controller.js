'use strict';

var module = angular.module('supportAdminApp');

module.controller('TagListCtrl', ['$scope', '$rootScope', '$timeout', '$state', '$uibModal',
  'AuthService', 'TagService',
  function ($scope, $rootScope, $timeout, $state, $modal, $authService, $tagService) {
    /**
     * Check if user is logged in
     */
    $scope.authorized = function () {
      return $authService.isLoggedIn();
    };

    /**
     * Show label from select options
     */
    $scope.showLabel = function (val, options) {
      var label = '';
      angular.forEach(options, function (option) {
        if (option.value == val) {
          label = option.name;
        }
      });
      return label;
    };

    /**
     * Show label from categories
     */
    $scope.showCategories = function (categories) {
      var labels = [];
      if (angular.isArray(categories)) {
        angular.forEach($scope.tagCategories, function (option) {
          if (categories.indexOf(option.value) !== -1) {
            labels.push(option.name);
          }
        });
      }
      return labels.join(',');
    };


    $scope.tags = [];
    $scope.tagName = '';
    $scope.isLoading = false;
    // find tags by name
    $scope.findTag = function () {
      $scope.isLoading = true;
      $tagService.findTags($scope.tagName).then(
        function (tags) {
          $scope.tags = tags;
          $timeout(function () {
            $scope.isLoading = false;
            $('.footable').trigger('footable_redraw');
          }, 300);
        },
        function (error) {
          $scope.isLoading = false;
          $scope.$broadcast('alert.AlertIssued', {
            type: 'danger',
            message: error.error
          });
        });
    };
    // go to edit tag page with given id
    $scope.editTag = function (id) {
      $state.go("index.tags.edit", {tagId: id});
    };
    //delete tag by id
    $scope.deleteTag = function (id) {
      if (!confirm('Are you sure want to delete this tag?')) {
        return;
      }
      $tagService.deleteTag(id).then(
        function () {
          $scope.findTag();
        },
        function (error) {
          $scope.$broadcast('alert.AlertIssued', {
            type: 'danger',
            message: error.error
          });
        });
    };
    $scope.findTag();
  }
]);
