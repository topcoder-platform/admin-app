'use strict';

var module = angular.module('supportAdminApp');

/**
 * The parent controller for the challange forums states
 */
module.controller('index.v5ChallengeForums', ['$scope', 'AuthService', 'ChallangeForumService', '$state', '$stateParams', 'Alert', '$uibModal',
  function ($scope, $authService, $challangeForumService, $state, $stateParams, $alert, $modal) {
    /**
     * A flag to determine the forum existance.
     */
    $scope.hasForum = true;

    /**
     * A flag to determine the member existance.
     */
    $scope.hasMember = true;

    /**
     * The state object.
     */
    $scope.$state = $state;

    /**
     * The challange id from route.
     */
    $scope.challengeID = $stateParams.id;

    /**
     * The forum collection.
     */
    $scope.forums = [];

    /**
     * The user collection.
     */
    $scope.users = [];

    /**
     * The selected forum.
     */
    $scope.currentForum = '';

    /**
     * A flag to show loader.
     */
    $scope.isLoading = false;

    /**
     * Init the initial values.
     */
    $scope.init = function () {
      $challangeForumService.findVanillaGroupByChallengeId($scope.challengeID).then(
        function (forums) {
          $scope.forums = forums;
          $scope.hasForum = forums.length > 0;
        },
        function (error) {
          $scope.hasForum = false;
          $alert.error(error.message, $scope);
          $scope.setLoading(false);
        }
      );
    }();

    /**
     * Get forum members
     * @param forumIndex form index
     */
    $scope.getMembers = function (forumIndex) {
      $scope.currentForum = $scope.forums[forumIndex];
      $scope.isLoading = true;
      $challangeForumService.getVanillaGroupMembers($scope.currentForum.groupID).then(
        function (members) {
          $scope.users = members;
          $scope.isLoading = false;
          $scope.hasMember = members.length > 0;
        },
        function (error) {
          $scope.hasMember = false;
          $alert.error(error.message, $scope);
          $scope.isLoading = false;
        }
      );

    };

    /**
     * open dialog to add member
      * @param forumIndex forum index
     */
    $scope.openAddMemberDialog = function (forumIndex) {
      $scope.currentForum = $scope.forums[forumIndex];
      var modalInstance = $modal.open({
        size: 'md',
        templateUrl: 'app/forums/add-member.html',
        controller: 'forums.AddMemberDialogController',
        resolve: {
          group: function () { return $scope.currentForum; },
          user: function () { return null; }
        }
      });

    };

    /**
    * open dialog to edit member
    * @param memberIndex member index
    */
    $scope.openEditMemberDialog = function (memberIndex) {
      var user = $scope.users[memberIndex];
      var modalInstance = $modal.open({
        size: 'md',
        templateUrl: 'app/forums/add-member.html',
        controller: 'forums.AddMemberDialogController',
        resolve: {
          group: function () { return $scope.currentForum; },
          user: function () { return user; }
        }
      });
    };

    /**
     * Open dialog to manage roles
     * @param userIndex member index
     */
    $scope.openManageRoleDialog = function (userIndex) {
      var currentUser = $scope.users[userIndex];
      var modalInstance = $modal.open({
        size: 'md',
        templateUrl: 'app/forums/manage-role.html',
        controller: 'forums.RolesManageDialogController',
        resolve: {
          user: function () { return currentUser; }
        }
      });
    };

    /**
     * Archive the forum
     * @param forumIndex forum list index
     */
    $scope.archiveForum = function (forumIndex) {
      var forum = $scope.forums[forumIndex];
      $alert.clear();
      $scope.isLoading = true;
      $challangeForumService.archiveGroup(forum.groupID).then(function (forums) {
        $alert.success('Forum archived successfully.', $scope);
        $scope.forums.forEach(function (val) {
          if (val.groupID === forum.groupID) {
            val.archived = true;
          }
        })
      }).catch(function (error) {
        $alert.error(error.message, $scope);
      }).finally(function () {
        $scope.isLoading = false;
      });
    };

    /**
     * Remove member from group.
     * @param userIndex user list index
     */
    $scope.removeMember = function (userIndex) {
      $alert.clear();
      $scope.isLoading = true;
      var currentUser = $scope.users[userIndex];
      $challangeForumService.removeUserFromGroup(currentUser.userID, $scope.currentForum.groupID).then(function () {
        $challangeForumService.getVanillaGroupMembers($scope.currentForum.groupID).then(
          function (members) {
            $scope.users = members;
            $scope.isLoading = false;
            $scope.hasMember = members.length > 0;
            $alert.success('Member removed success fully.', $scope);
          },
          function (error) {
            $scope.hasMember = false;
            $alert.error(error.message, $scope);
            $scope.isLoading = false;
          }
        );
      }).catch(function (error) {
        $alert.error(error.message, $scope);
      }).finally(function () {
        $scope.isLoading = false;
      });
    };

    /**
     * Check can show user list
     */
    $scope.showUsers = function () {
      return $scope.users && $scope.users.length > 0;
    }

    /**
     * Validate the user authentication
     */
    $scope.authorized = function () {
      return $authService.isLoggedIn();
    };
  }
]);
