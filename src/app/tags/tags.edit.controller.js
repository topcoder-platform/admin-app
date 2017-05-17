'use strict';

var module = angular.module('supportAdminApp');

module.controller('EditTagCtrl', ['$rootScope','$scope', 'TagService', '$state','$stateParams', '$log', '$timeout',
  function($rootScope, $scope, $tagService, $state, $stateParams, $log) {
    $scope.loading = true;
    $scope.processing = false;
    $scope.editTag = {};
    $scope.originalDomain = [];
    $scope.editCategories = {
      options:[]
    };
    $scope.editDomains = {
      options: []
    };
    $scope.tags = [];

    function _init() {
      $tagService.findTags().then(function (data) {
        $scope.tags = data;
      }, function(error) {
        $log.error('get tags failed');
        $log.error(error);
        $scope.processing = false;
        $scope.$emit('alert.AlertIssued', {
          type: 'danger',
          message: error.error
        });
      });
    }
    _init();
    $tagService.findTagById($stateParams.tagId).then(function(data){
      $scope.loading = false;
      $scope.editTag = data;
      $scope.originalDomain = angular.copy(data.domain);
      if (data.categories) {
        for (var i = 0; i < data.categories.length; i++) {
          var category = data.categories[i];
          for (var j = 0; j < $scope.tagCategories.length; j++) {
            if (category === $scope.tagCategories[j].value) {
              $scope.editCategories.options.push($scope.tagCategories[j]);
              break;
            }
          }
        }
      }
      if (data.domain) {
        for (var i = 0; i < data.domain.length; i++) {
          var domain = data.domain[i];
          for (var j = 0; j < $scope.tagDomains.length; j++) {
            if (domain === $scope.tagDomains[j].value) {
              $scope.editDomains.options.push($scope.tagDomains[j]);
              break;
            }
          }
        }
      }
      },
      function(error) {
        $log.error('get tag details failed');
        $log.error(error);
        $scope.$emit('alert.AlertIssued', {
          type: 'danger',
          message: error.error
        });
      });

    /**
     * This function is invoked when the submit form is submitted
     */
    $scope.submitTag = function() {
      $scope.$broadcast('alert.ClearAll', {});
      // check whether the new name conflicts with another tag
      for (var i = 0; i < $scope.tags.length; i++) {
        if ($scope.editTag.name.toLowerCase() === $scope.tags[i].name.toLowerCase() && $scope.editTag.id !== $scope.tags[i].id) {
          alert('Another tag with the same name [' + $scope.editTag.name + '] already exists');
          return;
        }
      }
      $scope.processing = true;
      $scope.editTag.updatedBy = $rootScope.currentUser.id;
      $scope.editTag.synonyms =  $scope.editForm.synonyms? $scope.editForm.synonyms.split(','):[];
      $scope.editTag.categories = [];
      angular.forEach($scope.editCategories.options, function(c){
        $scope.editTag.categories.push(c.value);
      });
      $scope.editTag.domain = [];
      angular.forEach($scope.editDomains.options, function(c){
        $scope.editTag.domain.push(c.value);
      });
      $tagService.updateTagSync($scope.editTag, $scope.originalDomain).then(function(){
          $state.go('index.tags.list');
        },
        function(error) {
          $log.error('edit tag failed');
          $log.error(error);
          $scope.processing = false;
          $scope.$emit('alert.AlertIssued', {
            type: 'danger',
            message: error.error
          });
        });
    };
  }
]);
