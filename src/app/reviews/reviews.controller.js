'use strict';

var module = angular.module('supportAdminApp');

module.controller('reviews.UpdateController', [
  '$scope', '$rootScope', '$uibModalInstance', 'ReviewService', 'Alert', 'challenge', 'action',
  function ($scope, $rootScope, $modalInstance, $reviewService, $alert, challenge, action) {

    /**
     * Object storing state of review
     */
    $scope.form = {
      action: action,
      value: '',
      isCheck: undefined,
      errorMsg: '',
    };

    /**
     * Check challenge status and phase type before reset action
     * @returns boolean
     */
    $scope.checkValid = function () {
      const ValidPhases = ['Aggregation', 'Final Fix', 'Final Review'];

      if (challenge.status.toLowerCase() !== 'active') {
        this.form.errorMsg =  'Status of challenge is not active';
        this.form.isCheck = false;
        return this.form.isCheck;
      }

      if (challenge.currentPhases.length === 0) {
        this.form.errorMsg =  'Active Phase of challenge should be in [Aggregation, Final Fix, Final Review]';
        this.form.isCheck = false;
        return this.form.isCheck;
      } else {
        var hasPhase = false;
        challenge.currentPhases.forEach(function(p) {
          ValidPhases.forEach(function(item) {
            if (item === p.phaseType) {
              hasPhase = true;
            }
          });
        });
        this.form.errorMsg =  hasPhase === true ? '' : 'Active Phase of challenge should be in [Aggregation, Final Fix, Final Review]';
        this.form.isCheck = false;
        return this.form.isCheck;
      }

      this.form.isCheck = true;
      return true;
    };


    /**
     * Close Modal
     */
    $scope.cancel = function () {
      $modalInstance.close();
    };

    /**
     * Save review update and close modal
     */
    $scope.save = function () {
      $alert.clear();
      switch (action) {
        case 'reset review':
          $reviewService.resetReview(challenge.id).then(
            function (response) {
              angular.copy(challenge);
              $modalInstance.close();
            },
            function (error) {
              $alert.error(error.error, $scope);
            }
          );
          break;
        case 'reset aggregation':
          $reviewService.resetAggregation(challenge.id).then(
            function (response) {
              angular.copy(challenge);
              $modalInstance.close();
            },
            function (error) {
              $alert.error(error.error, $scope);
            }
          );
          break;
        case 'update autopilot':
          if(window.confirm('Are you sure you want to save changes?')) {
            $reviewService.updateAutopilot(challenge.id, $scope.form.value).then(
              function (response) {
                angular.copy(challenge);
                $modalInstance.close();
              },
              function (error) {
                $alert.error(error.error, $scope);
              }
            );
          }
          break;
      };
    };


  }
]);

module.controller('reviews.ActionController', [
  '$scope', '$rootScope', '$uibModalInstance', 'ReviewService', 'Alert', 'reviewId', 'action',
  function ($scope, $rootScope, $modalInstance, $reviewService, $alert,reviewId, action) {

    /**
     * Object storing state of review
     */
    $scope.form = {
      action: action
    };

    /**
     * Close modal
     */
    $scope.cancel = function () {
      $modalInstance.close();
    };

    /**
     * Save review action and close modal
     */
    $scope.save = function () {
      $alert.clear();
      switch (action) {
        case 'reopen review':
          $reviewService.reopenReview(reviewId).then(
            function (response) {
              $modalInstance.close();
            },
            function (error) {
              $alert.error(error.error, $scope);
            }
          );
          break;
        case 'delete review':
          $reviewService.deleteReview(reviewId).then(
            function (result) {
              $modalInstance.close(result);
            },
            function (error) {
              $alert.error(error.error, $scope);
            }
          );
          break;
      }
    }
  }
]);