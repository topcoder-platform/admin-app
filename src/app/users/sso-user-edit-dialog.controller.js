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

    // The user logins.
    $scope.userLogins = [];

    // the current sso user login
    $scope.currentUserLogin = {};

    // true if details are being loaded/saved
    $scope.isLoading = false;

    /**
       * Close dialog
       */
    $scope.close = function () {
      $modalInstance.close();
    };

    /**
     * Load SSO user logins.
     */
    $scope.loadData = function () {
      $scope.isLoading = true;
      UserService
        .getSsoUserLogins($scope.user.id)
        .then(function (data) {
          $scope.userLogins = data;
        })
        .catch(function (error) {
          $alert.error(error.error, $scope);
        })
        . finally(function () {
          $scope.isLoading = false;
        });
    }

    /**
     * Create the SSO user login.
     */
    $scope.save = function () {
      $scope.isLoading = true;

      // There are some extra properties that from the table listing that are rejected
      // by the backend, so we need to create a new object.
      var userLogin = {
        userId: $scope.currentUserLogin.userId,
        name: $scope.currentUserLogin.name,
        email: $scope.currentUserLogin.email,
        provider: $scope.currentUserLogin.provider
      };

      if ($scope.isAdding) {
        UserService
          .createSsoUserLogin($scope.user.id, userLogin)
          .then(function (data) {
            $scope
              .userLogins
              .push($scope.currentUserLogin);
            $scope.isAdding = false;
          })
          .catch(function (error) {
            $alert.error(error.error, $scope);
          })
          . finally(function () {
            $scope.isLoading = false;
          });
      } else {

        UserService
          .updateSsoUserLogin($scope.user.id, userLogin)
          .then(function (data) {
            $scope.isEditing = false;
          })
          .catch(function (error) {
            $alert.error(error.error, $scope);
          })
          . finally(function () {
            $scope.isLoading = false;
          });
      }
    }

    /**
     * Retrieves the SSO login providers.
     */
    $scope.loadSsoProviders = function () {
      UserService
        .getSsoLoginProviders()
        .then(function (data) {
          $scope.providers = data.map(function (provider) {
            return provider.name
          });
        })
        .catch(function (error) {
          $alert.error(error.error, $scope);
        })
    }

    /**
     * @param {Object} userLogin The user login.
     * Removes the SSO login.
    */
    $scope.remove = function (userLogin) {
      $scope.isLoading = true;
      $scope.isEditing = false;
      $scope.isAdding = false;

      UserService
        .deleteSsoUserLogin($scope.user.id, userLogin.provider)
        .then(function (data) {
          _.remove($scope.userLogins, function (item) {
              return item.provider === userLogin.provider;
            });
        })
        .catch(function (error) {
          $alert.error(error.error, $scope);
        })
        . finally(function () {
          $scope.isLoading = false;
        });
    }

    /**
     * @param {Object} userLogin The user login.
     * Select the login from the table and populates it's details below.
     */
    $scope.selectRow = function (userLogin) {
      $scope.currentUserLogin = userLogin;
      $scope.userForm.$setUntouched()
      $scope.isEditing = true;
      $scope.isAdding = false;
    }

    /**
     * Showing add form.
     */
    $scope.add = function () {
      $scope.isAdding=true; 
      $scope.isEditing = false;
      $scope.currentUserLogin={};
      $scope.userForm.$setUntouched();
    }

    $scope.loadData();
    $scope.loadSsoProviders();
  }
]);
