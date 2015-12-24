'use strict';

angular.module('supportAdminApp')
  .controller('LoginController', [
              '$scope', '$rootScope', '$location', '$state', 'AuthService', 'TokenService', 'UserService', 'DEV_JWT',
    function ($scope, $rootScope, $location, $state, $authService, $tokenService, $userService, DEV_JWT) {

      $scope.loggingIn = false;

      $scope.isLoggingIn = function() {
        return $scope.loggingIn;
      };

      $scope.submit = function() {

        $tokenService.setAppirioJWT(DEV_JWT);
        
        $rootScope.currentUser = 	{
            id: "22838965", 
            handle: "admin", 
            firstName: "Administrator", 
            lastName: "Appirio", 
            active: true, 
            credential: {
                hasPassword: true, 
            }, 
            email: "devops+test@appirio.com", 
            emailActive: true, 
            createdAt: "2015-11-20T15:19:07.000Z", 
            modifiedAt: "2015-12-24T04:04:29.000Z" 
        };
        $state.go('index.main')
      };
  }]);
