'use strict';

var module = angular.module('supportAdminApp');

module.controller('TagListCtrl', ['$scope', '$rootScope', '$timeout', '$interval', '$state', '$uibModal',
  'AuthService', 'TagService', '$q',
  function ($scope, $rootScope, $timeout, $interval, $state, $modal, $authService, $tagService, $q) {

    /**
     * The error handler.
     */
    var errorHandler = function (error) {
      $scope.isLoading = false;
      $scope.$broadcast('alert.AlertIssued', {
        type: 'danger',
        message: error.error
      });
    };

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
      if ($scope.isSyncing) {
        return;
      }
      $scope.isLoading = true;
      $tagService.findTags($scope.tagName).then(
        function (tags) {
          $scope.tags = tags;
          $timeout(function () {
            $scope.isLoading = false;
            $('.footable').trigger('footable_redraw');
          }, 300);
        }, errorHandler);
    };
    // go to edit tag page with given id
    $scope.editTag = function (id) {
      $state.go("index.tags.edit", {tagId: id});
    };
    //delete tag by id
    $scope.deleteTag = function (tag) {
      if (!confirm('Are you sure want to delete this tag?')) {
        return;
      }
      $tagService.deleteTagSync(tag).then(
        function () {
          $scope.findTag();
        }, errorHandler);
    };

    /**
     * Sync technologies from informix.
     */
    $scope.syncFromInformix = function() {
      $scope.isLoading = true;
      $tagService.getTechnologiesFromInformix().then(function (data) {
        var requests = [];
        data.forEach(function (technology) {
          var found = false;
          for (var i = 0; i < $scope.tags.length; i++) {
            var tag = $scope.tags[i];
            if (tag.name.toLowerCase() === technology.name.toLowerCase()) {
              found = true;
              if (!tag.domain) {
                tag.domain = ['technologies'];
              } else if (tag.domain.indexOf('technologies') === -1) {
                tag.domain.push('technologies');
              } else {
                break;
              }
              requests.push($tagService.updateTag(tag));
              break;
            }
          }
          if (!found) {
            var newTag = {
              name: technology.name,
              domain: ['technologies'],
              categories: ['develop'],
              status: technology.status.id === 1 ? 'approved' : 'pending',
              priority: 1
            };
            requests.push($tagService.createTag(newTag));
          }
        });
        $q.all(requests).then(function () {
          $scope.findTag();
        });
      });
    };
    $scope.findTag();
    $tagService.getTechnologiesFromInformix();
  }
]);
