'use strict';

var module = angular.module('supportAdminApp');

module.controller('v5challenge.ListController', ['$scope', '$rootScope', 'AuthService', 'ChallengeService', 'Alert',
    function ($scope, $rootScope, $authService, $challengeService, $alert) {
        $scope.isLoading = false;
        $scope.totalChallenges = 0;
        $scope.searched = false;
        $scope.filterCriteria = {
            page: 1,
            perPage: 25,
            challengeId: null,
            legacyId: null,
            type: null,
            track: null,
            status: 'Active',
        };
        $scope.statusOptions = [
            'New',
            'Draft',
            'Active',
            'Completed'
        ];
        $scope.challengeTypes = [];
        $scope.challengeTracks = [];
        $scope.challenges = [];

        // load challenge types
        $challengeService.v5.getChallengeTypes().then(function (challengeTypes) {
            $scope.challengeTypes = challengeTypes;
        }).catch(function (challengeTypeError) {
            $alert.error(challengeTypeError.error, $rootScope);
        });

        // load challenge tracks
        $challengeService.v5.getChallengeTracks().then(function (challengeTracks) {
            $scope.challengeTracks = challengeTracks;
        }).catch(function (challengeTypeError) {
            $alert.error(challengeTypeError.error, $rootScope);
        });

        /**
         * Check if user is logged in.
         */
        $scope.authorized = function () {
            return $authService.isLoggedIn();
        };

        /**
         * handles the search button click.
         */
        $scope.search = function () {
            $scope.searched = true
            $alert.clear();
            $scope.isLoading = true;
            var filter = '';
            filter = 'page=' + $scope.filterCriteria.page +
                '&perPage=' + $scope.filterCriteria.perPage +
                '&status=' + $scope.filterCriteria.status;

            if ($scope.filterCriteria.legacyId) {
                filter += '&legacyId=' + $scope.filterCriteria.legacyId;
            }

            if ($scope.filterCriteria.type) {
                filter += '&types[]=' + $scope.filterCriteria.type;
            }

            if ($scope.filterCriteria.track) {
                filter += '&tracks[]=' + $scope.filterCriteria.track;
            }

            if ($scope.filterCriteria.challengeId) {
                filter += '&id=' + $scope.filterCriteria.challengeId;
            }

            $challengeService.v5.search(filter).then(function (response) {
                $scope.challenges = response.result;
                $scope.totalChallenges = response.totalCount;
            }).catch(function (error) {
                $alert.error(error.error, $rootScope);
            }).finally(function () {
                $scope.isLoading = false;
            });
        };

        /**
         * gets the pagination array.
         */
        $scope.getPageArray = function () {
            var res = [];
            for (var i = $scope.filterCriteria.page - 5; i <= $scope.filterCriteria.page; i++) {
                if (i > 0) {
                    res.push(i);
                }
            }
            for (var i = $scope.filterCriteria.page + 1; i <= $scope.getLastPage() && i <= $scope.filterCriteria.page + 5; i++) {
                res.push(i);
            }
            return res;
        };

        /**
         * handles the change pagination.
         * @param {number} pageNumber the selected page number.
         */
        $scope.changePage = function (pageNumber) {
            if (pageNumber === 0 || pageNumber > $scope.getLastPage() || $scope.filterCriteria.page === pageNumber) {
                return false;
            }
            $scope.filterCriteria.page = pageNumber;
            $scope.search();
        };

        /**
         * gets the last page of pagination.
         */
        $scope.getLastPage = function () {
            return parseInt($scope.totalChallenges / 25) + 1;
        };
    }
]);