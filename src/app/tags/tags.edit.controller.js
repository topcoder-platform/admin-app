'use strict';

var module = angular.module('supportAdminApp');

module.controller('EditTagCtrl', ['$rootScope','$scope', 'TagService', '$state','$stateParams', '$log', '$timeout',
  function($rootScope, $scope, $tagService, $state, $stateParams, $log, $timeout) {
    $scope.loading = true;
    $scope.processing = false;
    $scope.editTag = {};
    $scope.editCategories = {
      options:[]
    };
    $tagService.findTagById($stateParams.tagId).then(function(data){
        $scope.loading = false;
        $timeout(function(){
           $scope.editTag = data;
           $scope.editTag.previousDomain = data.domain;
           $scope.editForm.synonyms = Array.isArray($scope.editTag.synonyms)?  $scope.editTag.synonyms.join(','):'';
          angular.forEach($scope.tagCategories, function(c){
            $scope.editTag.categories = $scope.editTag.categories || [];
            if($scope.editTag.categories.indexOf(c.value) !== -1 ){
              $scope.editCategories.options.push(c);
            }
          });
        },0);
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
      $scope.processing = true;
      $scope.editTag.updatedBy = $rootScope.currentUser.id;
      $scope.editTag.synonyms =  $scope.editForm.synonyms? $scope.editForm.synonyms.split(','):[];
      $scope.editTag.categories = [];
      angular.forEach($scope.editCategories.options, function(c){
        $scope.editTag.categories.push(c.value);
      });
      $tagService.updateTagSync($scope.editTag).then(function(){
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
