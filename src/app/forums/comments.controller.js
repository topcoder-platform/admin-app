'use strict';

var module = angular.module('supportAdminApp');

/**
 * The parent controller for the challange forums states
 */
module.controller('index.v5ChallengeForumsComment', [
  '$scope',
  '$stateParams',
  'ChallangeForumService',
  'UserService',
  'Alert',
  '$q',
  function ($scope, $stateParams, ChallangeForumService, UserService, $alert, $q) {

    // currently selected user identity
    $scope.userId = $stateParams.id;

    // true if details are being loaded/saved
    $scope.isLoading = false;

    // selected user comments
    $scope.comments = [];

    // selected user object
    $scope.user = {};

    // flag to determin comment existance
    $scope.hasComments = false;

    /**
     * Load SSO user logins.
     */
    $scope.loadData = function () {
      $scope.isLoading = true;
      UserService.find({ filter: "id=" + $scope.userId })
        .then(function (users) {
          if (users && users.length > 0) {
            ChallangeForumService.getUserByHandle(users[0].handle)
              .then(function (user) {
                $scope.user = user;
                ChallangeForumService.getComments(user.userID)
                  .then(function (comments) {
                    $scope.comments = comments;
                    $scope.hasComments = comments && comments.length > 0;
                  })
                  .catch(function (error) {
                    $alert.error(error.message, $scope);
                  })
              })
              .catch(function (error) {
                $alert.error(error.message, $scope);
              })
          }
        })
        .catch(function (error) {
          $alert.error(error.message, $scope);
        })
        .finally(function () {
          $scope.isLoading = false;
        });
    };

    /**
     * Validate the user authentication
     */
    $scope.authorized = function () {
      return $authService.isLoggedIn();
    };

    /**
     * Init trigger for initial load.
     */
    $scope.loadData();
  }
]);
