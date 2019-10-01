module.controller('groups.GroupEditDialogController', [
  '$scope',
  '$uibModalInstance',
  'GroupService',
  'Alert',
  'parentScope',
  function ($scope, $modalInstance, GroupService, $alert, parentScope) {
    $scope.group = {};
    // true if group is being saved.
    $scope.isLoading = false;

    /**
     * Close dialog
     */
    $scope.close = function () {
      $modalInstance.close();
    };

    /**
     * Create or updates the user SSO profile.
     */
    $scope.save = function () {
      $scope.isLoading = true;
      GroupService
        .create($scope.group)
        .then(function (data) {
          parentScope.fetch();
          $scope.close();
        })
        .catch(function (error) {
          $alert.error(error.error, $scope);
        })
        . finally(function () {
          $scope.isLoading = false;
        });
    }
  }
]);
