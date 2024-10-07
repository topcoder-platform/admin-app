'use strict';

var module = angular.module('supportAdminApp');

module.controller('ReviewerListController', [
    '$scope',
    '$rootScope',
    'ReviewerService',
    'Alert',
    '$timeout',
    'TOPCODER_URL',
    'ONLINE_REVIEW_URL',
    function ($scope, $rootScope, ReviewerService, $alert, $timeout, TOPCODER_URL, ONLINE_REVIEW_URL) {
        // true data is loading
        $scope.isLoading = false;

        // list data
        $scope.reviewSummaries = [];

        $scope.TOPCODER_URL = TOPCODER_URL;
        $scope.ONLINE_REVIEW_URL = ONLINE_REVIEW_URL;

        /**
         * Get all reviewer summaries
         */
        $scope.fetch = function () {
            $alert.clear();
            $scope.isLoading = true;
            ReviewerService.fetch()
                .then(function (data) {
                    console.log(JSON.stringify(data.result.content));
                    $scope.reviewSummaries = data.result.content;
                    if ($scope.reviewSummaries.length) {
                        // make sure changes to scope are applied
                        // and redraw footable table with current group list
                        $timeout(function () {
                            $('.footable').trigger('footable_redraw');
                            $scope.isLoading = false;
                        });
                    } else {
                        $scope.isLoading = false;
                    }
                })
                .catch(function (error) {
                    $alert.error(error.error, $rootScope);
                    $scope.isLoading = false;
                });
        };

        // init footable plugin
        angular.element(document).ready(function () {
            $('.footable').footable();
        });

        // load the review summaries on controller init
        $scope.fetch();
       
    }
]);
