'use strict';

var module = angular.module('supportAdminApp');

module.controller('sso.AddSSOController', ['$log', '$scope', '$parse', 'AuthService', 'SSOService', function ($log, $scope, $parse, $authService, $ssoService) {

    $scope.errors = [];
    $scope.response = [];
    $scope.save = function() {
        $log.debug($scope.jsonInput);
    };

    $scope.add = function() {
    	$log.debug($scope.jsonInput);

    	if($scope.activate) {
    	    $scope.activate = true;
    	} else {
    	    $scope.activate = false;
    	}

    	for ( var i=0, len = $scope.jsonInput.length; i<len; i++) {
		    $ssoService.addSSOUser($scope.jsonInput[i], $scope.activate, $scope.showFullResponse).then(
                   function(response) {
                        $scope.response.push(response);
                   },
                   function(error) {
                        $scope.errors.push(error);
                   }
            );
        }
    };
}]);