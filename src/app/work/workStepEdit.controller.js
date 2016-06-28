'use strict';

var module = angular.module('supportAdminApp');

module.controller('WorkStepEditCtrl', ['$scope', 'WorkService', '$timeout', '$state', '$rootScope', '$filter',
  function($scope, $workService, $timeout, $state, $rootScope, $filter) {    
    $scope.projectId = $state.params.id;
    $scope.stepId = $state.params.stepId;
    $scope.startsAtOpen = false;
    $scope.endsAtOpen = false;
    $scope.stepType = '';
    $scope.stepCreator = '';
    $scope.stepCreatedAt = '';
    $scope.found = false;

    var STATUS = $scope.STATUS = [
      'CLOSED',
      'SCHEDULED',
      'Started',
      'In progress'
    ];

    $scope.isLoading = false;
    $scope.stepItem = {      
      status : '',
      startsAt: '',
      endsAt: '',
      detail: {},
      stepType: ''
    };
   
    
    /**
     * errorHandler handle error using alert
     * @param  {object} error error object     
     */
    var errorHandler = function(error) {
      $scope.isLoading = false;
      $rootScope.$broadcast('alert.ClearAll');
      $timeout(function () {
        $rootScope.$broadcast('alert.AlertIssued', {
          type: 'danger',
          message: error.error
        });
      }, 100);      
    };
    /**
     * getStep load step     
     */
    var getStep = function() {
      $scope.isLoading = true;      
      $workService.getWorkSteps($scope.projectId).then(
        function(responseWork) {          
          responseWork.forEach(function (step) {            
            if (step.id === $scope.stepId) {
              console.log("found step", step);
              $scope.found = true;
              $scope.stepItem.status = step.status;
              $scope.stepItem.endsAt = new Date(step.endsAt);
              $scope.stepItem.startsAt = new Date(step.startsAt);
              $scope.stepItem.detail = step.detail;
              $scope.stepCreator = step.createdBy;
              $scope.stepItem.stepType = $scope.stepType = step.stepType;
              $scope.stepCreatedAt = step.createdAt;
            }
          });          
          $scope.isLoading = false;
          if (!$scope.found) {
            console.log("not found step for: ", $scope.stepId);            
          }
        }, errorHandler);
    };

    /**
     * open datetimepicker
     * @param  {object} e         event object
     * @param  {string} inputName startsAt | endsAt     
     */
    $scope.openCalendar = function (e, inputName) {
      if ($scope[inputName + 'Open']) {
        return;
      }

      if (e && e.preventDefault) {
        e.preventDefault();
      }
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      $scope.startsAtOpen = false;
      $scope.endsAtOpen = false;
      $scope[inputName + 'Open'] = true;
      console.log("open: ", inputName);
    };

    /**
     * validateEndTime callback executed when endsAt datetimepicker closed.
     *   if endsAt < startsAt, 1) display error 2) force endsAt to startsAt + 1 second.
     * @param  {object} args info about time picked in the datetimepicker
     */
    $scope.validateEndTime = function (args) {
      var value = args.closeDate;
      if ($scope.stepItem.startsAt > value) {        
        var forcedEndsAt = new Date($scope.stepItem.startsAt.getTime() + 1000);
        var errorMsg = '\'Ends At\' cannot be before \'Starts At\'. Set to ' +
          $filter('fmtDate')(forcedEndsAt);
        errorHandler({ error: errorMsg });
        console.log(errorMsg);
        $scope.stepItem.endsAt = forcedEndsAt;
      }
    };

    /**
     * putProjectStep update project step     
     */
    $scope.putProjectStep = function () {
      $workService.putWorkStep($scope.projectId, $scope.stepId, $scope.stepItem).then(
        function () {
          $state.go('index.work.list', {id: $scope.projectId});
        }, errorHandler);
    };

    getStep();
  }
]);