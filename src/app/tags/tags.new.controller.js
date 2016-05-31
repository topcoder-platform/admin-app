'use strict';

var module = angular.module('supportAdminApp');

module.controller('NewTagCtrl', ['$rootScope','$scope', 'TagService', '$state', '$log',
  function($rootScope, $scope, $tagService, $state, $log) {
    $scope.newTag = {
      status:'approved'
    };
    $scope.processing = false;
    /**
     * This function is invoked when the submit form is submitted
     */
    $scope.submitTag = function() {
      $scope.$broadcast('alert.ClearAll', {});
      $scope.processing = true;
      $scope.newTag.synonyms = $scope.addForm.synonyms ? $scope.addForm.synonyms.split(',') :[];

      $scope.newTag.categories = [];
      angular.forEach($scope.addForm.categories, function(c){
        $scope.newTag.categories.push(c.value);
      });

      $tagService.createTag($scope.newTag).then(function(){
          $state.go('index.tags.list');
        },
        function(error) {
          $log.error('create tag failed');
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
