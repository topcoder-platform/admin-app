'use strict';

angular.module('supportAdminApp')
  .controller('LoginController', [
              '$log', '$scope', '$rootScope', '$location', '$state', 'AuthService', 'TokenService', 'UserService', 'Alert',
    function ($log, $scope, $rootScope, $location, $state, $authService, $tokenService, $userService, $alert) {

      $scope.loggingIn = false;

      $scope.formLogin = {
        username: null,
        password: null,
        loggingIn: false,
        valid: function() {
          return !!(this.username && this.username.length > 0 &&
                  this.password && this.password.length > 0);
        }
      };

      $scope.login = function() {

        $alert.clear();
        
        var loginSuccess = function() {
          var token = $tokenService.decodeToken();
          $log.debug(token);
          if($.inArray('administrator', token && token.roles) < 0) {
            $alert.error('Permission denied.', $scope);
            $scope.formLogin.loggingIn = false;
            return;
          }
          $userService.findById(token.userId).then(
            function(currentUser) {
              $rootScope.currentUser = currentUser;
              $state.go('index.users');
            },
            function(err) {
              $log.error('Failed to get user data.');
              $log.error(err);
              $state.go('index.users');
            }
          );
        };

        var loginFailure = function(err) {
          $log.error('Login Failed')
          $log.error(err)
          var reason = err && err.data && err.data.error,
              msg = err && err.data && err.data.error_description || err.statusText;
          if(reason === "invalid_user_password") {
            msg = "Wrong username or password.";
          }
          $alert.error(msg, $scope);
          $scope.formLogin.loggingIn = false;
        };

        var options = {
          username: $scope.formLogin.username,
          password: $scope.formLogin.password,
          success: loginSuccess,
          error: loginFailure
        };

        $scope.formLogin.loggingIn = true;
        $authService.login(options);
      };

  }]);