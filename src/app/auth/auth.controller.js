'use strict';

angular.module('supportAdminApp')
  .controller('LoginController', [
              '$q', '$scope', '$state', 'AuthService',
    function ($q, $scope, $state, $authService) {

      $scope.logginOut = false;
      $scope.errorMessage = '';

      function onLogOut() {
        $authService.login();
        // we could stop loggin out indicator but we don't do it, because redirecting doesn't happen immediately
        // so we keep showing loging out indicator even if log out already complete
        // anyway we go from this page
        // $scope.logginOut = false;
      }

      // if we come to this page and user is logged in, and we are not loggin out
      // then we shouldn't be on this page so we redirect to index
      if ($authService.isLoggedIn() && !$authService.logginOut) {
        $state.go('index.users');

      // if we are loggin out currently, then show "loggin out..." message
      } else if ($authService.logginOut) {
        $scope.logginOut = true;
        $authService.logginOut.then(onLogOut);

      // as we come to this page after AuthService.authenticate()
      // the only one case when we can come to this page now if access was denied for current user
      // so we show permissions denied error
      } else {
        $scope.errorMessage = $authService.ERROR.NO_PERMISSIONS;
      }

      $scope.logout = function() {
        $scope.errorMessage = '';
        $scope.logginOut = true;
        $authService.logout().then(onLogOut);
      }

  }]);
