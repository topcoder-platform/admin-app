'use strict';

angular.module('supportAdminApp')
  .controller('LoginCtrl', [
              '$scope', '$rootScope', '$location', '$state', 'AuthService', 'TokenService', 'UserV3Service',
    function ($scope, $rootScope, $location, $state, $authService, $tokenService, $userV3Service) {

      $scope.submit = function() {
        var loginSuccess = function() {
          var token = $tokenService.decodeToken();
          // TODO: check permission
          console.log('**** token ****');
          console.log(token);
          $userV3Service.loadUser().then(function(currentUser) {
            console.log('Login Success');
            $rootScope.currentUser = currentUser;
            $state.go('index.main')
          });
        };

        var loginFailure = function() {
          console.log('Login Failed')
        };

        var options = {
          username:$scope.username,
          password:$scope.password,
          success: loginSuccess,
          error: loginFailure
        };

        $authService.login(options);
    };
  }]);
