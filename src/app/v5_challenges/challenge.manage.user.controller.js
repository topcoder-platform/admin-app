'use strict';

var module = angular.module('supportAdminApp');

module.controller('v5challenge.ManageUserController', ['$scope', '$rootScope', 'AuthService', 'ChallengeService', 'Alert', '$stateParams', '$state', '$uibModal',
    function ($scope, $rootScope, $authService, $challengeService, $alert, $stateParams, $state, $modal) {
        $scope.isLoading = false;
        $scope.id = $stateParams.id;
        $scope.title = $state.current.data.pageTitle;
        $scope.isLoading = true;
        $scope.totalCount = 0;
        $scope.users = [];
        $scope.roles = [];

        $scope.filterCriteria = {
            page: 1,
            perPage: 100
        };

        // get resource roles
        $challengeService.v5.getResourceRoles().then(function (data) {
            $scope.roles = data;
        }).catch(function (roleError) {
            $alert.error(roleError.error, $rootScope);
        });

        /**
         * gets the user data.
         */
        $scope.search = function () {
            $scope.isLoading = true;
            var filter = '&page=' + $scope.filterCriteria.page
                + '&perPage=' + $scope.filterCriteria.perPage;
            $challengeService.v5.getChallengeResources($stateParams.id, filter).then(function (data) {
                $scope.users = data.result;
                $scope.totalCount = data.totalCount;
            }).catch(function (error) {
                $alert.error(error.error, $rootScope);
            }).finally(function () {
                $scope.isLoading = false;
            });
        };

        /**
         * gets the role by id.
         * @param {string} roleId the role id.
         */
        $scope.getRole = function (roleId) {
            var role = _.find($scope.roles, function (x) {
                if (x.id == roleId) {
                    return x;
                }
            });
            if (role) {
                return role.name;
            } else {
                return 'NOT FOUND';
            }
        };

        /**
         * handles the remove user click.
         * @param {object} user the selected user.
         */
        $scope.removeUser = function (user) {
            var confirmation = 'Are you sure? You want to remove user ' + user.memberHandle + '?';
            if (window.confirm(confirmation)) {
                user.isRemoving = true;
                $challengeService.v5.deleteChallengeResource({
                    challengeId: $stateParams.id, memberHandle: user.memberHandle, roleId: user.roleId
                }).then(function () {
                    $scope.search();
                }).catch(function (error) {
                    $alert.error(error.error, $rootScope);
                }).finally(function () {
                    user.isRemoving = false;
                });
            }
        };

        /**
         * handles add user click.
         */
        $scope.openAddUserDialog = function () {
            var modalInstance = $modal.open({
                size: 'sm',
                templateUrl: 'app/v5_challenges/add-user-challenge.html',
                controller: 'v5challenge.AddUserController',
                resolve: {
                    parentScope: function () {
                        return $scope;
                    },
                    challenge: function () {
                        return { id: $stateParams.id };
                    }
                }
            });
        };

        /**
         * handles change to a specific page.
         * @param {number} pageNumber the page number.
         */
        $scope.changePage = function (pageNumber) {
            if (pageNumber === 0 || pageNumber > $scope.getLastPage() || $scope.filterCriteria.page === pageNumber) {
                return false;
            }
            $scope.filterCriteria.page = pageNumber;
            $scope.search();
        };

        /**
         * get the number array that shows the pagination bar.
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
         * handles move to the last page.
         */
        $scope.getLastPage = function () {
            return parseInt($scope.totalCount / 100) + 1;
        };

        $scope.search();
    }
]);