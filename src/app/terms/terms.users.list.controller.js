'use strict';

var module = angular.module('supportAdminApp');

/**
 * Controller for list user for the terms
 */
module.controller('terms.ListTermsUsersController', ['$scope', '$stateParams', 'TermsService', 'IdResolverService', 'UserService',
    '$uibModal', 'Alert', '$q',
    function ($scope, $stateParams, TermsService, IdResolverService, UserService, $modal, $alert, $q) {
        $scope.users = {}
        $scope.refresh = true;

        // filter criteria
        $scope.filterCriteria = {};
        $scope.filterCriteria.signTermsFrom = '';
        $scope.filterCriteria.signTermsTo = '';
        $scope.filterCriteria.userId = '';
        $scope.filterCriteria.handle = '';

        // the current page number
        $scope.pageNumber = 1;
        // the total terms of use count in DB
        $scope.totalTerms = 0;
        $scope.selection = {}
        $scope.selection.isAllSelected = false;

        $scope.calender = {};
        $scope.calender.signTermsFromOpen = false;
        $scope.calender.signTermsToOpen = false;

        // list data
        $scope.data = [];
        var loadUser = IdResolverService.getUserResolverFunction($scope.users);

        /**
         * fetches the data according to criteria.
         */
        $scope.fetch = function () {
            $alert.clear();
            var filter = '';
            filter += "page=" + $scope.pageNumber;
            filter += "&perPage=" + 25;

            if ($scope.filterCriteria.userId && $scope.filterCriteria.userId.toString().trim()) {
                filter += "&userId=" + $scope.filterCriteria.userId;
            }

            if ($scope.filterCriteria.signTermsFrom && $scope.filterCriteria.signTermsFrom.trim()) {
                filter += "&signedAtFrom=" + $scope.filterCriteria.signTermsFrom;
            }

            if ($scope.filterCriteria.signTermsTo && $scope.filterCriteria.signTermsTo.trim()) {
                filter += "&signedAtTo=" + $scope.filterCriteria.signTermsTo;
            }

            if ($scope.filterCriteria.handle && $scope.filterCriteria.handle.trim()) {
                if ($scope.filterCriteria.userId && $scope.filterCriteria.userId.toString().trim()) {
                    UserService.getProfile($scope.filterCriteria.handle).then(function (profileData) {
                        if (profileData.userId !== $scope.filterCriteria.userId) {
                            $scope.totalTerms = 0;
                            $scope.data = [];
                        } else {
                            TermsService.getTermUser($stateParams.termsId, filter).then(function (data) {
                                // list data
                                $scope.data = data.result.map(function (param) {
                                    return { id: param, isSelected: false }
                                });
                                $scope.totalTerms = data.totalCount;
                                $scope.data.forEach(function (element) {
                                    loadUser(element.id);
                                });
                            }).catch(function (error) {
                                $alert.error(error.error, $scope);
                            });
                        }
                    }).catch(function (error) {
                        $alert.error(error.error, $scope);
                    });
                } else {
                    UserService.getProfile($scope.filterCriteria.handle).then(function (profileData) {
                        filter += "&userId=" + profileData.userId;
                        TermsService.getTermUser($stateParams.termsId, filter).then(function (data) {
                            // list data
                            $scope.data = data.result.map(function (param) {
                                return { id: param, isSelected: false }
                            });
                            $scope.totalTerms = data.totalCount;
                            $scope.data.forEach(function (element) {
                                loadUser(element.id);
                            });
                        }).catch(function (error) {
                            $alert.error(error.error, $scope);
                        });
                    }).catch(function (error) {
                        $alert.error(error.error, $scope);
                    });
                }
            } else {
                TermsService.getTermUser($stateParams.termsId, filter).then(function (data) {
                    // list data
                    $scope.data = data.result.map(function (param) {
                        return { id: param, isSelected: false }
                    });
                    $scope.totalTerms = data.totalCount;
                    $scope.data.forEach(function (element) {
                        loadUser(element.id);
                    });
                }).catch(function (error) {
                    $alert.error(error.error, $scope);
                });
            }
        }

        /**
         * handles the apply filter click.
         */
        $scope.applyFilter = function () {
            $scope.pageNumber = 1;
            $scope.fetch();
        };

        $scope.fetch()

        /**
         * handles add term click and open dialog.
         */
        $scope.openAddUserDialog = function () {
            var modalInstance = $modal.open({
                size: 'sm',
                templateUrl: 'app/terms/sign-terms-dialog.html',
                controller: 'terms.SignTermsController',
                resolve: {
                    parentScope: function () {
                        return $scope;
                    },
                    term: function () {
                        return { id: $stateParams.termsId, title: $stateParams.title }
                    }
                }
            });
        };

        /**
         * handles the toggle all click.
         */
        $scope.toggleAll = function () {
            $scope.data.forEach(function (item) { item.isSelected = $scope.selection.isAllSelected; });
        };

        /**
         * handles remove member click.
         * @param {object} member the selected member
         */
        $scope.removeMember = function (member) {
            $alert.clear()
            TermsService.removeTermUser($stateParams.termsId, member.id)
                .then(function () {
                    $alert.success('User removed successfully', $scope);
                    $scope.fetch()
                })
                .catch(function () {
                    $alert.error(error.error, $scope);
                })
        }

        /**
         * handles remove selected click.
         */
        $scope.removeSelected = function () {
            $alert.clear();
            $scope.processing = true;
            var selectedData = getSelectedData();

            $q.all(selectedData.map(function (data) {
                return TermsService.removeTermUser($stateParams.termsId, data.id);
            })).then(function () {
                $scope.fetch();
            })
                .catch(function (error) {
                    $alert.error(error.error, $scope);
                }).finally(function () {
                    $scope.processing = false;
                });
        }

        /**
         * handles move to the last page
         */
        $scope.getLastPage = function () {
            return parseInt($scope.totalTerms / 25) + 1;
        };

        // change to a specific page
        $scope.changePage = function (pageNumber) {
            if (pageNumber === 0 || pageNumber > $scope.getLastPage() || $scope.pageNumber === pageNumber) {
                return false;
            }
            $scope.pageNumber = pageNumber;
            $scope.fetch();
        };

        /**
         * get the number array that shows the pagination bar
         */
        $scope.getPageArray = function () {
            var res = [];
            for (var i = $scope.pageNumber - 5; i <= $scope.pageNumber; i++) {
                if (i > 0) {
                    res.push(i);
                }
            }
            for (var i = $scope.pageNumber + 1; i <= $scope.getLastPage() && i <= $scope.pageNumber + 5; i++) {
                res.push(i);
            }
            return res;
        };

        /**
         * handles move to the last page
         */
        $scope.getLastPage = function () {
            return parseInt($scope.totalTerms / 25) + 1;
        };

        /**
         * handles Open datetimepicker.
         * @param {Object} e the event object.
         * @param {String} inputName the name of input.
         */
        $scope.openCalendar = function (e, inputName) {
            if ($scope.calender[inputName + 'Open']) {
                return;
            }

            if (e && e.preventDefault) {
                e.preventDefault();
            }
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
            $scope.calender[inputName + 'Open'] = true;
        };

        /**
         * Return data records which are selected in the table by checkboxes
         *
         * @return {Array} data records
         */
        function getSelectedData() {
            return $scope.data.filter(function (item) {
                return item.isSelected
            });
        }

        /**
         * Checks if any records are selected in the table
         * and updates $scope.hasSelected value
         */
        $scope.checkSelected = function () {
            $scope.hasSelected = !!getSelectedData().length;
        }
    }
]);