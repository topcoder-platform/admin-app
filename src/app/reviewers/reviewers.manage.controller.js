'use strict';

var module = angular.module('supportAdminApp');
module.controller('ReviewersManageController', [
    '$scope',
    '$rootScope',
    'ReviewerService',
    'Alert',
    '$timeout',
    '$stateParams', 
    '$state',
    'PROFILES_URL',
    'ONLINE_REVIEW_URL',
    function ($scope, $rootScope, ReviewerService, $alert, $timeout, $stateParams, $state, PROFILES_URL, ONLINE_REVIEW_URL) {
        // true data is loading
        $scope.isLoading = false;
        $scope.id = $stateParams.id;
        $scope.pageTitle = $state.current.data.pageTitle;
        console.log("ID: " + $stateParams.id)
        // list data
        $scope.reviewApplications = [];

        $scope.PROFILES_URL = PROFILES_URL;
        $scope.ONLINE_REVIEW_URL = ONLINE_REVIEW_URL;

        /**
         * Get all reviewer applications for the challenge
         */
        $scope.fetch = function () {
            $alert.clear();
            $scope.isLoading = true;
            ReviewerService.getApplicationsForChallenge($stateParams.id)
                .then(function (data) {
                    console.log(JSON.stringify(data.result.content));
                    $scope.reviewApplications = data.result.content;
                    if ($scope.reviewApplications.length) {
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

        /**
         * Handles the Approve Reviewer button.
         * @param {object} reviewApplication the application being approved
         */
        $scope.approveApplication = function (reviewApplication) {
            ReviewerService.approveApplication(reviewApplication, $scope.id)
            .then(function () {
                $scope.fetch();    
            })
            .catch(function (error) {
                $alert.error(error.error, $rootScope);
                $scope.isLoading = false;
            });
        };


        /**
         * Handles the Reject Pending button.
         * @param {object} reviewApplication the application being approved
         */
        $scope.rejectPending = function () {
            ReviewerService.rejectPending($scope.id)
                .then(function () {
                    $scope.fetch();
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
