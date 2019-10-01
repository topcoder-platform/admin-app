module.controller('users.SsoUserEditDialogController', [
  '$scope',
  '$uibModalInstance',
  'UserService',
  'Alert',
  'user',
  '$q',
  function ($scope, $modalInstance, UserService, $alert, user, $q) {

    // currently selected user object
    $scope.user = user;

    // These are the provider types accepted in the API.
    $scope.providerTypes = [
      'ad',
      'adfs',
      'auth0',
      'behance',
      'bitbucket',
      'dribbble',
      'facebook',
      'github',
      'google-oauth2',
      'linkedin',
      'samlp',
      'sfdc',
      'stackoverflow',
      'twitter'
    ];

    // true if details are being loaded/saved
    $scope.isLoading = false;
    
    /**
       * Close dialog
       */
    $scope.close = function () {
      $modalInstance.close();
    };

    /**
     * Load user profile.
     */
    $scope.loadData = function () {
      $scope.isLoading = true;
      UserService
        .findById($scope.user.id)
        .then(function (data) {
          $scope.user.profile = {};
          if (data.profile) {
            // we can't have all properties form profile as saving will fail. 
            $scope.user.profile = {
              userId: data.profile.userId,
              providerType: data.profile.providerType,
              provider: data.profile.provider
            }
          }
        })
        .catch(function (error) {
          $alert.error(error.error, $scope);
        })
        . finally(function () {
          $scope.isLoading = false;
        });
    }

    /**
     * Create or updates the user SSO profile.
     */
    $scope.save = function () {
      $scope.isLoading = true;
      UserService
        .createOrUpdateSSOUserLogin($scope.user.id, $scope.user.profile)
        .then(function (data) {
          $scope.close();
        })
        .catch(function (error) {
          $alert.error(error.error, $scope);
        })
        . finally(function () {
          $scope.isLoading = false;
        });
    }

    $scope.loadData();
  }
]);
