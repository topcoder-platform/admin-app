'use strict';

var module = angular.module('supportAdminApp');

module.controller('v5challenge.ListController', ['$scope', '$rootScope', '$location', 'AuthService', 'ChallengeService', 'Alert', 'CONNECT_URL', 'DIRECT_URL', 'WORK_MANAGER_URL', 'ONLINE_REVIEW_URL',
    function ($scope, $rootScope, $location, $authService, $challengeService, $alert, CONNECT_URL, DIRECT_URL, WORK_MANAGER_URL, ONLINE_REVIEW_URL) {
        $scope.isLoading = false;
        $scope.totalChallenges = 0;
        $scope.searched = false;
        $scope.filterCriteria = {
            page: 1,
            perPage: 25,
            name: null,
            challengeId: null,
            legacyId: null,
            type: null,
            track: null,
            status: 'Active',
        };

        $scope.CONNECT_URL = CONNECT_URL;
        $scope.DIRECT_URL = DIRECT_URL;
        $scope.WORK_MANAGER_URL = WORK_MANAGER_URL;
        $scope.ONLINE_REVIEW_URL = ONLINE_REVIEW_URL;

        /**
         * Checks for search parameters in the query string
         * If one is found and its a filter criteria, apply it
         */
        Object.keys($location.search()).forEach(function (key) {
            if ($scope.filterCriteria.hasOwnProperty(key)) {
                $scope.filterCriteria[key] = $location.search()[key];
            }
        });

        $scope.statusOptions = [
            '',
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
            $scope.challengeTypes = [{ abbreviation: null, name: '' }].concat(challengeTypes);
        }).catch(function (challengeTypeError) {
            $alert.error(challengeTypeError.error, $rootScope);
        });

        // load challenge tracks
        $challengeService.v5.getChallengeTracks().then(function (challengeTracks) {
            $scope.challengeTracks = [{ abbreviation: null, name: '' }].concat(challengeTracks);
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
                '&perPage=' + $scope.filterCriteria.perPage;

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

            if ($scope.filterCriteria.name) {
                filter += '&name=' + $scope.filterCriteria.name;
            }

            if ($scope.filterCriteria.status)
                filter += '&status=' + $scope.filterCriteria.status;

            $challengeService.v5.search(filter).then(function (response) {
                $scope.challenges = response.result;
                $scope.totalChallenges = response.totalCount;
            }).catch(function (error) {
                $alert.error(error.error, $rootScope);
            }).finally(function () {
                $scope.isLoading = false;
            });
            $location.search($scope.filterCriteria);
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

        /**
         * gets the challenge type details according to the id
         * @param {string} typeId
         * @returns {string} the abbreviation or empty string if not found
         */
        $scope.getChallengeType = function(typeId) {
            var challengeTypes = $scope.challengeTypes.filter(function(type) {
                return type.id == typeId;
            });
            if (Array.isArray(challengeTypes) && challengeTypes.length > 0)
                return challengeTypes[0];
            return null;
        }

        $scope.search();
    }
]);
