'use strict';

var module = angular.module('supportAdminApp');

module.controller('settings.Controller', ['$scope', 'AuthService', 'ONLINE_REVIEW_URL',
    function ($scope, $authService, ONLINE_REVIEW_URL) {
        $scope.ONLINE_REVIEW_URL = ONLINE_REVIEW_URL;

        /**
         * Check if user is logged in.
         */
        $scope.authorized = function () {
            return $authService.isLoggedIn();
        };
    }
]);
