'use strict';

var module = angular.module('supportAdminApp');

module.controller('addmembers.AddMemberController', [
  '$log',
  '$scope',
  '$filter',
  '$timeout',
  '$uibModal',
  'Alert',
  'MemberService',
  'GroupService',
  'GroupMemberService',
  function ($log, $scope, $filter, $timeout, $modal, $alert, $memberService, GroupService, GroupMemberService) {

    $scope.errors = [];
    $scope.response = [];
    $scope.selectAll = true;
    $scope.importCounter = 0;
    $scope.filter = {
      status: ""
    };

    // footable
    angular
      .element(document)
      .ready(function () {
        $('.footable').footable({addRowToggle: true});
      });

    $scope.$on('users.TableDataUpdated', function (event) {
      $timeout(function () {
        $('.footable').trigger('footable_redraw');
      }, 100);
    });

    // Get all groups.
    GroupService
      .fetch()
      .then(function (result) {
        $scope.allGroups = result.content;
      })
      .catch(function (error) {
        $alert.error(error.error, $scope);
      });

    $scope.save = function () {
      $log.debug($scope.users);
    };

    $scope.add = function () {
      var usersToAdd = $filter('filter')($scope.users, {
        isSelected: true,
        importStatus: $scope.filter.status
      });
      _.each(usersToAdd, function (user) {
        $scope.addUser(user);
      })
    };

    $scope.addUser = function (user) {
      var theUser = angular.copy(user);
      // Delete not needed properties as the API will consider it a Bad Request.
      delete theUser.isSelected;
      delete theUser.importStatus;
      delete theUser.importDetails;
      delete theUser.group;
      delete theUser.ssoProviderType;
      delete theUser.ssoProvider;
      delete theUser.ssoUserId;

      $scope.importCounter++;
      $memberService
        .addMember(theUser, $scope.activate, $scope.showFullResponse)
        .then(function (response) {
          user.importStatus = response.status;
          user.importDetails = response.message;
          $scope.importCounter--;
          if (user.importStatus == "Success") {
            user.id = response.content.id;
            $scope.addUserToGroup(user, user.group);
          }
        }, function (error) {
          user.importStatus = error.status;
          user.importDetails = error.message;
          $scope.importCounter--;
        });
    }

    /**
     * Assign a user to the specified group.
     * @param user the user.
     * @param group the group to assign the user to.
     */
    $scope.addUserToGroup = function (user, group) {
      $scope.importCounter++;
      GroupMemberService
        .addMember(group.id, {
          memberId: user.id,
          membershipType: 'user'
        })
        .then(function (response) {

          user.importStatus = "Success";
          user.importDetails = "";
          if (response.result && response.result.status === 200) {
            user.importStatus = "Fail";
            user.importDetails = "Error when adding user to Group:" + response.result.content;
          }
        })
        .catch(function (error) {
          user.importStatus = "Fail";
          user.importDetails = "Error when adding user to Group:" + error.error;
        })
        . finally(function () {
          $scope.importCounter--;
        });
    }

    $scope.importCallback = function (jsonArray) {
      // transform the csv file data into a proper user object.
      _
        .each(jsonArray, function (user) {
          user.country = {
            name: user.country
          };
          // if password is missing, generate a random one; has to contain a number.
          user.credential = {
            password: user.password || (shortid.generate() + Math.floor(Math.random() * 10 + 1))
          };
          user.profiles = [
            {
              providerType: user.ssoProviderType,
              provider: user.ssoProvider,
              userId: user.ssoUserId
            }
          ];
          user.group = _.find($scope.allGroups, function (group) {
            return group.id == user.group;
          });

          // by default all records are selected.
          user.isSelected = true;
          // default status to empty so that it works properly when filtering.
          user.importStatus = "";
          user.importDetails = "";
        });

      $scope.$broadcast('users.TableDataUpdated');
    }

    $scope.selectAllUsers = function () {
      _
        .each($scope.users, function (user) {
          user.isSelected = $scope.selectAll
        });
    }

    $scope.openBulkEditDialog = function (index) {
      var modalInstance = $modal.open({
        size: 'md',
        templateUrl: 'app/addmembers/bulk-edit-dialog.html',
        controller: 'users.BulkEditDialogController',
        resolve: {
          users: function () {
            return $filter('filter')($scope.users, {
              isSelected: true,
              importStatus: $scope.filter.status
            });
          },
          groups: function () {
            return $scope.allGroups;
          }
        }
      });
    };

    $scope.export = function () {
      var content = 'handle,firstName,lastName,email,country,ssoProviderType,ssoProvider,ssoUserId,gr' +
          'oup,importStatus,importDetails';
      var filteredUsers = $filter('filter')($scope.users, {
        isSelected: true,
        importStatus: $scope.filter.status
      });
      _.each(filteredUsers, function (user) {
        var properties = [
          user.handle,
          user.firstName,
          user.lastName,
          user.email,
          user.country.name,
          user.profiles[0].providerType,
          user.profiles[0].provider,
          user.profiles[0].userId,
          user.group.id,
          user.importStatus,
          user.importDetails
        ];

        content += '\n' + properties.join(',');
      });

      var blob = new Blob([content], {type: 'text/csv'});
      $scope.usersUrl = (window.URL || window.webkitURL).createObjectURL(blob);
    }
  }
]);