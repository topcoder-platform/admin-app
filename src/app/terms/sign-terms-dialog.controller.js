module.controller('terms.SignTermsController', [
  '$scope',
  '$uibModalInstance',
  'UserService',
  'TermsService',
  'Alert',
  'parentScope',
  'term',
  function ($scope, $modalInstance, UserService, TermsService, $alert, parentScope, term) {
    $scope.term = term
    $scope.handle = '';
    $scope.isLoading = false;

    /**
     * Close dialog.
     */
    $scope.close = function () {
      $modalInstance.close();
    };

    /**
     * handles save click.
     */
    $scope.save = function () {
      $scope.clearError()
      $scope.isLoading = true;

      UserService.getUserByHandleFilter($scope.handle).then(function (data) {
        if (data && data.length > 0) {
          TermsService.addUserTerms({ userId: data[0].id, termsOfUseId: $scope.term.id })
            .then(function () {
              $alert.success('Terms Added Successfullly to user ' + $scope.handle, $scope);
              if (parentScope.refresh) {
                parentScope.fetch();
              }
            })
            .catch(function (termError) {
              $alert.error(termError.error, $scope);
            })
            .finally(function () {
              $scope.isLoading = false;
            });
        } else {
          $scope.isLoading = false;
          $alert.error('User with handle ' + $scope.handle + ' Not Found', $scope);
        }
      })
        .catch(function (error) {
          $scope.isLoading = false;
          $alert.error(error.error, $scope);
        })
    };

    /**
     * clears the alerts.
     */
    $scope.clearError = function () {
      $alert.clear();
    };
  }
]);
