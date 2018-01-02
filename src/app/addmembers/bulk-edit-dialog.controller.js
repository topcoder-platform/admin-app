module.controller('users.BulkEditDialogController', [
  '$scope', '$uibModalInstance', 'GroupService', 'GroupMemberService', 'Alert', 'users', 'groups',
  function ($scope, $modalInstance, GroupService, GroupMemberService, $alert, users, groups) {

    // The user list
    $scope.users = users;
    // the group list
    $scope.groups = groups;
    if (users && users.length > 0) {
      $scope.group = users[0].group;
      $scope.providerType = users[0].profiles[0].providerType;
      $scope.provider = users[0].profiles[0].provider;
    }

    /**
     * Update list of users
     */
    $scope.bulkUpdate = function() {
      _.each($scope.users, function (user) {
        user.group = $scope.group;
        user.profiles[0].providerType = $scope.providerType;
        user.profiles[0].provider = $scope.provider;
      });

      $modalInstance.close();
    }

    /**
     * Close dialog
     */
    $scope.close = function () {
      $modalInstance.close();
    };
  }
]);
