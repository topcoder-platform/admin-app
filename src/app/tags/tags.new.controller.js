'use strict';

var module = angular.module('supportAdminApp');

module.controller('NewTagCtrl', ['$rootScope','$scope', 'TagService', '$state', '$log',
  function($rootScope, $scope, $tagService, $state, $log) {

    /**
     * The error handler.
     */
    var errorHandler = function (error) {
      $scope.$emit('alert.AlertIssued', {
        type: 'danger',
        message: error.error
      });
    };
    
    $scope.newTag = {
      status:'approved'
    };

    $scope.tags = [];


    function _init() {
      $tagService.findTags().then(function (data) {
        $scope.tags = data;
      }, errorHandler);
    }
    _init();

    $scope.processing = false;
    /**
     * This function is invoked when the submit form is submitted
     */
    $scope.submitTag = function() {
      $scope.$broadcast('alert.ClearAll', {});
      for (var i = 0; i < $scope.tags.length; i++) {
        if ($scope.tags[i].name.toLowerCase() === $scope.newTag.name.toLowerCase()) {
          alert('A tag with the same name [' + $scope.newTag.name + '] already exists');
          return false;
        }
      }
      $scope.processing = true;
      $scope.newTag.synonyms = $scope.addForm.synonyms ? $scope.addForm.synonyms.split(',') :[];
      $scope.newTag.domain = [];
      $scope.newTag.categories = [];
      angular.forEach($scope.addForm.categories, function(c){
        $scope.newTag.categories.push(c.value);
      });
      angular.forEach($scope.addForm.domains, function(c){
        $scope.newTag.domain.push(c.value);
      });

      $tagService.createTagSync($scope.newTag).then(function(){
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
