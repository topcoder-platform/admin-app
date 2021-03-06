'use strict';

var module = angular.module('supportAdminApp');

module.controller('v5challenge.ManageUserController', ['$scope', '$rootScope', 'AuthService', 'ChallengeService', 'Alert', '$stateParams', '$state', '$uibModal', '$q',
    function ($scope, $rootScope, $authService, $challengeService, $alert, $stateParams, $state, $modal, $q) {
        $scope.isLoading = false;
        $scope.id = $stateParams.id;
        $scope.title = $state.current.data.pageTitle;
        $scope.isLoading = true;
        $scope.totalCount = 0;
        $scope.users = [];
        $scope.roles = [{name: "", id: ""}];
        const DEFAULT_ROLE_FILTER_NAME = "Submitter";
        $scope.selectedUsers = {};
        $scope.isRemovingMultipleUsers = false;
        $scope.selectAll = false;
        $scope.usersEmails = [];

        $scope.filterCriteria = {
            page: 1,
            perPage: 100,
            roleId: ""
        };

        /**
         * gets challenge detail
         * If the state id is a legacy id it fetches the challengeId by using the corresponding service
         * else it returns a promise with the state id
         * @returns {Promise} the challengeId
         */
        $scope.getChallengeDetail = function() {
            if (isNaN($stateParams.id)) {
                return Promise.resolve($stateParams.id);
            }
            else {
                return $challengeService.v5.getChallengeByLegacyId($stateParams.id)
                .then(function (data) {
                    return data.id;
                }).catch(function (error) {
                    $alert.error(error.error, $rootScope);
                    $scope.error = true;
                })
            }
        }

        /**
         * gets the user data.
         */
        $scope.search = function () {
            $scope.users = [];
            $scope.selectAll = false;
            $scope.selectedUsers = {};
            $scope.isLoading = true;
            var filter = '&page=' + $scope.filterCriteria.page
                + '&perPage=' + $scope.filterCriteria.perPage;
            if ($scope.filterCriteria.roleId != "")
                filter += '&roleId=' + $scope.filterCriteria.roleId;
            $scope.getChallengeDetail().then(function(id) {
                $scope.id = id;
                $challengeService.v5.getChallengeResources(id, filter).then(function (data) {
                    $scope.users = data.result;
                    $scope.totalCount = data.totalCount;
                    $challengeService.v5.getResourceEmails($scope.users).then(function (data) {
                        $scope.usersEmails = data;
                    });
                }).catch(function (error) {
                    $alert.error(error.error, $rootScope);
                }).finally(function () {
                    if ($scope.users.length == 0 && $scope.filterCriteria.page > 1) { // goes back to last page with results if the current one is empty
                        $scope.filterCriteria.page = $scope.getLastPage();
                        $scope.search();
                    }
                    else {
                        $scope.isLoading = false;
                    }
                });
            });
        };

        /**
         * gets the role by id.
         * @param {string} roleId the role id.
         */
        $scope.getRole = function (roleId) {
            var role = _.find($scope.roles, { id: roleId });
            if (role) {
                return role.name;
            } else {
                return 'NOT FOUND';
            }
        };

        /**
         * handles select all checkbox select event
         */
        $scope.toggleSelectall = function () {
            $scope.users.forEach(function(user) {
                $scope.selectedUsers[user.id] = $scope.selectAll;
            });
        }

        /**
         * handles unselecting the "select all" checkbox when a single user checkbox is toggled
         */
        $scope.toggleSelectSingleUser = function() {
            if ($scope.selectAll)
                $scope.selectAll = false;
        }

        /**
         * performs user removal, used by both single-user and multiple-user remove buttons
         * gets the e-mail by user id.
         * @param {string} userId the user id.
         */
        $scope.getEmail = function (userId) {
            var user = _.find($scope.usersEmails, { userId: parseInt(userId) });
            if (user) {
                return user.email;
            } else {
                return 'NOT FOUND';
            }            
        };

        /**
         * handles the remove user click.
         * @param {object} user the selected user.
         */
        $scope.removeUser = function (user) {
            return $challengeService.v5.deleteChallengeResource({
                challengeId: $scope.id, memberHandle: user.memberHandle, roleId: user.roleId
            }).then(function() {
                $scope.users = $scope.users.filter(function(member) {
                    return member.id !== user.id;
                })
                if ($scope.selectedUsers.hasOwnProperty(user.id))
                    delete $scope.selectedUsers[user.id];                
            })
        };

        /**
         * handles the remove user click.
         * @param {object} user the selected user.
         */
        $scope.removeSingleUser = function (user) {
            var confirmation = 'Are you sure? You want to remove user ' + user.memberHandle + '?';
            if (window.confirm(confirmation)) {
                user.isRemoving = true;
                $scope.removeUser(user)
                .then(function () {
                    $scope.search();
                }).catch(function (error) {
                    $alert.error(error.error, $rootScope);
                }).finally(function () {
                    user.isRemoving = false;
                });
            }
        };

        /**
         * handles removing the selected users by clicking on "Remove Seleted"
         */
        $scope.removeSelectedUsers = function () {
            var confirmation = $scope.getNumberOfSelectedUsers() + ' users will be removed, are you sure?';
            if (window.confirm(confirmation)) {
                var usersToRemove = $scope.users.filter(function(user) {
                    return ($scope.selectedUsers.hasOwnProperty(user.id) && $scope.selectedUsers[user.id]);
                })

                $scope.isRemovingMultipleUsers = true;
                $q.all(usersToRemove.map(function(user) {
                    return $scope.removeUser(user);
                })).then(function () {
                    $scope.search();
                }).catch(function (error) {
                    $alert.error(error.error, $rootScope);
                }).finally(function () {
                    $scope.isRemovingMultipleUsers = false;
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
                        return { id: $scope.id };
                    }
                }
            });
        };

        /**
         * handles checking for selected users
         * @param {*} pageNumber
         */
        $scope.getNumberOfSelectedUsers = function() {
            return Object.keys($scope.selectedUsers).reduce(function (num, userId) {
                if ($scope.selectedUsers[userId])
                    return num + 1;
                return num;
            }, 0);
        }

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
            return Math.ceil($scope.totalCount / $scope.filterCriteria.perPage);
        };

        // get resource roles on first load and then search
        $challengeService.v5.getResourceRoles().then(function (data) {
            $scope.roles = _.orderBy($scope.roles.concat(data), 'name');
            $scope.filterCriteria.roleId = _.find($scope.roles, { name: DEFAULT_ROLE_FILTER_NAME }).id
            $scope.search();
        }).catch(function (roleError) {
            $alert.error(roleError.error, $rootScope);
        });

    }
]);
