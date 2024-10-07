'use strict';

var module = angular.module('supportAdminApp');

/**
 * The parent controller for the reviewers
 */
module.controller('ReviewerController', [
    '$scope', 'AuthService', '$state',
    function ($scope, $authService, $state) {
        $scope.$state = $state;

        /**
         * Validate the user authentication
         */
        $scope.authorized = function () {
            return $authService.isLoggedIn();
        };
    }
]);
