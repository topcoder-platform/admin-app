'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.BillingAccountsListController', ['$scope', '$rootScope', '$log',
  'BillingAccountService', 'Alert', '$timeout', 'billingaccounts.Constants', 'ClientService',
    function ($scope, $rootScope, $log, BillingAccountService, $alert, $timeout, constants, ClientService) {
      // search
      $scope.formSearch = {
        isLoading: false,
        criteria: {
          status: "1"
        },
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      // the current page number
      $scope.pageNumber = 1;
      // the total account count in DB
      $scope.totalAccounts = 0;
      // the sort criteria
      $scope.sortCriteria = undefined;
      // the sort order
      $scope.sortOrder = 'asc';

      // list data
      $scope.accounts = [];

      $scope.search = function (reset) {
        if (reset) {
          $scope.pageNumber = 1;
          delete $scope.sortCriteria;
          $scope.sortOrder = 'asc';
        }
        $scope.formSearch.setLoading(true);
        BillingAccountService.search({
          name: $scope.formSearch.criteria.name,
          user: $scope.formSearch.criteria.user,
          status: $scope.formSearch.criteria.status,
          startDate: $scope.formSearch.criteria.startDate,
          endDate: $scope.formSearch.criteria.endDate},
          {
            page: $scope.pageNumber,
            limit: 25,
            sort: $scope.sortCriteria ? $scope.sortCriteria + ' ' + $scope.sortOrder : ''
          }
        ).then(function (data) {
          $scope.formSearch.setLoading(false);
          $scope.accounts = data.content;
          $scope.totalAccounts = data.metadata.totalCount;
        }).catch(function (error) {
          $scope.formSearch.setLoading(false);
          $alert.error(error.error, $rootScope);
        });
      };

      // sort by criteria
      $scope.sort = function (criteria) {
        if (criteria === $scope.sortCriteria) {
          if ($scope.sortOrder === 'asc') {
            $scope.sortOrder = 'desc';
          } else {
            $scope.sortOrder = 'asc';
          }
        } else {
          $scope.sortOrder = 'asc';
        }
        $scope.sortCriteria = criteria;
        $scope.search();
      };

      // change to a specific page
      $scope.changePage = function (pageNumber) {
        if (pageNumber === 0 || pageNumber > $scope.getLastPage()) {
          return false;
        }
        $scope.pageNumber = pageNumber;
        $scope.search();
      };

      // get the number array that shows the pagination bar
      $scope.getPageArray = function() {
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

      // move to the last page
      $scope.getLastPage = function () {
        return parseInt(($scope.totalAccounts + 24) / 25);
      };

      /**
       * open datetimepicker
       * @param  {object} e         event object
       * @param  {string} inputName startsAt | endsAt
       */
      $scope.openCalendar = function (e, inputName) {
        if ($scope[inputName + 'Open']) {
          return;
        }

        if (e && e.preventDefault) {
          e.preventDefault();
        }
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        $scope[inputName + 'Open'] = true;
      };

      // search on page load
      $scope.search();
    }
]);