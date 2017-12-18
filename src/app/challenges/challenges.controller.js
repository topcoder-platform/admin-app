'use strict';

var module = angular.module('supportAdminApp');

module.controller('challenge.SearchController', ['$scope', '$rootScope', '$timeout', '$state',
  '$uibModal', 'AuthService', 'ChallengeService', 'ReviewService', 'Alert',
  function ($scope, $rootScope, $timeout, $state, $modal, $authService, $challengeService,
            $reviewService, $alert) {
    /**
     * Check if user is logged in
     */
    $scope.authorized = function () {
      return $authService.isLoggedIn();
    };

    /**
     * Object storing state of challenge search
     */
    $scope.challengeSearch = {
      isLoading: false,
      challengeFound: false,
      reviewFound: false,
      challengeId: '',
      setLoading: function (loading) {
        this.isLoading = loading;
      }
    };

    /** Challenge object of currently fetched challenge */
    $scope.challengeObj = null;
    $scope.isValidChallenge = false;

    /** list reviews of challenge **/
    $scope.reviews = [];

    // the current page number
    $scope.pageNumber = 1;
    // the total review count in DB
    $scope.totalReviews = 0;
    // the sort criteria
    $scope.sortCriteria = undefined;
    // the sort order
    $scope.sortOrder = 'asc';

    // sort by criteria
    $scope.sort = function (criteria) {
      if (criteria === $scope.sortCriteria) {
        if ($scope.sortOrder === 'asc') {
          $scope.sortOrder = 'desc';
        } else {
          $scope.sortOrder = 'asc';
        }
      } else {
        $scope.sortOrder = 'asc';
      }
      $scope.sortCriteria = criteria;
      $scope.findReviews();
    };
    // change to a specific page
    $scope.changePage = function (pageNumber) {
      if (pageNumber === 0 || pageNumber > $scope.getLastPage()) {
        return false;
      }
      $scope.pageNumber = pageNumber;
      $scope.findReviews();
    };
    // get the number array that shows the pagination bar
    $scope.getPageArray = function() {
      var res = [];
      for (var i = $scope.pageNumber - 5; i <= $scope.pageNumber; i++) {
        if (i > 0) {
          res.push(i);
        }
      }
      for (var i = $scope.pageNumber + 1; i <= $scope.getLastPage() && i <= $scope.pageNumber + 5; i++) {
        res.push(i);
      }
      return res;
    };
    // move to the last page
    $scope.getLastPage = function () {
      return parseInt(($scope.totalReviews+ 24) / 25);
    };

    /**
     * Get challenge by challengeId
     */
    $scope.findChallenge = function () {
      $alert.clear();
      $scope.challengeSearch.isLoading = true;
      $scope.challengeSearch.setLoading(true);
      $challengeService.findChallengeById($scope.challengeSearch.challengeId).then(
        function (responseChallenge) {
          $scope.findReviews();
          //Set of Challenge Phases
          $challengeService.getChallengePhases($scope.challengeSearch.challengeId).then(
            function(phases) {
              $scope.challengePhases = phases;
            },
            function(error) {
              $scope.$broadcast('alert.AlertIssued', {
                type: 'danger',
                message: error.error
              });
            }
          );
          $scope.challengeSearch.challengeFound = true;
          $scope.challengeObj = responseChallenge;
          $scope.challengeSearch.isLoading = false;
          $scope.challengeSearch.setLoading(false);
        },
        function (error) {
          $scope.challengeSearch.isLoading = false;
          $scope.challengeSearch.challengeFound = false;
          var errorMessage = error.error;
          if (error.status == 404) {
            errorMessage = 'Challenge with id ' + $scope.challengeSearch.challengeId +
              ' not found';
          }
          $scope.$broadcast('alert.AlertIssued', {
            type: 'danger',
            message: errorMessage
          });
        }
      );
    }

    /**
     * Get reviews by challengeId
     */
    $scope.findReviews = function () {
      $alert.clear();
      $scope.challengeSearch.isLoading = true;
      $scope.challengeSearch.setLoading(true);
      $reviewService.search($scope.challengeSearch.challengeId,
        {
          page: $scope.pageNumber,
          limit: 25,
          sort: $scope.sortCriteria ? $scope.sortCriteria + ' ' + $scope.sortOrder : ''
        }).then(function (data) {
        $scope.reviews = data.content;
        $scope.totalReviews = data.metadata.totalCount;
        if($scope.totalReviews === 0) {
          $scope.challengeSearch.reviewFound = false;
          $scope.$broadcast('alert.AlertIssued', {
            type: 'danger',
            message: 'No review record'
          });
        } else {
          $scope.challengeSearch.reviewFound = true;
        }
        $scope.challengeSearch.isLoading = false;
        $scope.challengeSearch.setLoading(false);
      }).catch(function (error) {
        $scope.challengeSearch.isLoading = false;
        $scope.$broadcast('alert.AlertIssued', {
          type: 'danger',
          message: error.error
        });
        $scope.challengeSearch.setLoading(false);
      });
    }

    /**
     * Open reset modal
     * @param action -- reset action name
     */
    $scope.openResetDialog = function (action) {
      var modalInstance = $modal.open({
        size: 'sm',
        templateUrl: 'app/reviews/review-reset-dialog.html',
        controller: 'reviews.UpdateController',
        resolve: {
          challenge: function () { return $scope.challengeObj; },
          action: function() { return action; }
        }
      });
    };

    /**
     * Open update autopilot modal
     */
    $scope.openUpdateAutopilotDialog = function() {
      var modalInstance = $modal.open({
        size: 'sm',
        templateUrl: 'app/reviews/review-update-autopilot-dialog.html',
        controller: 'reviews.UpdateController',
        resolve: {
          challenge: function () { return $scope.challengeObj },
          action: function() { return 'update autopilot'}
        }
      });
    }

    /**
     * Open update fixed challenge fee modal
     */
    $scope.openUpdateFixedFeeDialog = function() {
      var modalInstance = $modal.open({
        size: 'md',
        templateUrl: 'app/challenges/challenge-update-fixed-fee-dialog.html',
        controller: 'challenge.UpdateChallengeController',
        resolve: {
          challenge: function () { return $scope.challengeObj },
        }
      });
    }

    /**
     * Open update percentage challenge fee modal
     */
    $scope.openUpdatePercentageFeeDialog = function() {
      var modalInstance = $modal.open({
        size: 'md',
        templateUrl: 'app/challenges/challenge-update-percentage-fee-dialog.html',
        controller: 'challenge.UpdateChallengeController',
        resolve: {
          challenge: function () { return $scope.challengeObj }
        }
      });
    }

    /**
     * Open reopen review modal
     * @param reviewId
     */
    $scope.openReopenReviewDialog = function(reviewId) {
      var modalInstance = $modal.open({
        size: 'sm',
        templateUrl: 'app/reviews/review-action-dialog.html',
        controller: 'reviews.ActionController',
        resolve: {
          reviewId: function () { return reviewId; },
          action: function () { return 'reopen review'; }
        }
      });
    }

    /**
     * Open delete review modal
     * @param reviewId
     */
    $scope.openDeleteReviewDialog = function(reviewId) {
      $modal.open({
        size: 'sm',
        templateUrl: 'app/reviews/review-action-dialog.html',
        controller: 'reviews.ActionController',
        resolve: {
          reviewId: function () { return reviewId; },
          action: function() { return 'delete review'; }
        }
      }).result.then(function () {
        $scope.findReviews();
      });
    }


  }
]);

module.controller('challenge.UpdateChallengeController', [
  '$scope', '$rootScope', '$uibModalInstance', 'ChallengeService', 'Alert', 'challenge',
  function ($scope, $rootScope, $modalInstance, $challengeService, $alert, challenge){

    /**
     * Object storing state of challenge fixed fee modal
     */
    $scope.updateChallengeForm = {
      id:  challenge.id,
      isLoading: false,
      name:  challenge.name,
      fixedFee:  challenge.fixedFee ?  challenge.fixedFee : '',
      percentageFee: challenge.percentageFee ? challenge.percentageFee : '',
      setLoading: function (loading) {
        this.isLoading = loading;
      }
    };

    /**
     * Check Valid Number
     * @param value
     * @returns {boolean}
     */
    function checkNumber(value) {
      var re = /^[0-9]+.?[0-9]*$/;
      if (!re.test(value)) {
        $alert.error('Please input valid number', $scope);
        return false;
      }
      return true;
    }

    /**
     * Close Modal
     */
    $scope.cancel = function () {
      $modalInstance.close();
    }

    /**
     * Save Fixed Fee and Close Modal
     */
    $scope.saveFixedFee = function () {
      $alert.clear();
      if (!checkNumber($scope.updateChallengeForm.fixedFee)) return;
      if( !   $scope.updateChallengeForm.fixedFee && challenge.fixedFee === $scope.updateChallengeForm.fixedFee) {
        $alert.error('FixedFee is not changed.', $scope);
        return;
      }
      challenge.fixedFee = $scope.updateChallengeForm.fixedFee;

      $scope.updateChallengeForm.isLoading = true;
      $scope.updateChallengeForm.setLoading(true);
      if(window.confirm('Are you sure you want to save changes?')) {
        $challengeService.updateChallengeFixedFee(challenge).then(
          function (response) {
            $modalInstance.close();
          },
          function(error) {
            $scope.updateChallengeForm.isLoading = false;
            $scope.updateChallengeForm.setLoading(false);
            $alert.error(error.error, $scope);
          }
        );
      }
    };

    /**
     * Save Percentage Fee and Close Modal
     */
    $scope.savePercentageFee = function () {
      $alert.clear();
      if(!checkNumber($scope.updateChallengeForm.percentageFee)) return;
      if( !challenge.percentageFee && challenge.percentageFee === $scope.updateChallengeForm.percentageFee) {
        $alert.error('PercentageFee is not changed.', $scope);
        return;
      }

      challenge.percentageFee = $scope.updateChallengeForm.percentageFee;

      $scope.updateChallengeForm.isLoading = true;
      $scope.updateChallengeForm.setLoading(true);
      if(window.confirm('Are you sure you want to save changes?')) {
        $challengeService.updateChallengePercentageFee(challenge).then(
          function (response) {
            $modalInstance.close();
          },
          function(error) {
            $scope.updateChallengeForm.isLoading = false;
            $scope.updateChallengeForm.setLoading(false);
            $alert.error(error.error, $scope);
          }
        );
      }
    };

  }]);
