'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.BillingAccountsListController', ['$scope', '$rootScope', '$log', 'billingaccounts.Constants',
  'BillingAccountService', 'Alert', '$timeout', 'NgTableParams',
    function ($scope, $rootScope, $log, constants, BillingAccountService, $alert, $timeout, NgTableParams) {

      $scope.tableParams = new NgTableParams({
        page: 1,
        count: 50,
        sorting: {
          name: 'asc'
        },
      }, {
        counts: [],
        getData: function (params) {
          $scope.formSearch.setLoading(true);
          var sort = Object.keys(params.sorting())[0];
          var offset = params.count() * (params.page() - 1);
          return BillingAccountService.search({
            customer: params.filter().customer,
            user: params.filter().user,
            status: params.filter().status,
            startDate: params.filter().startDate,
            endDate: params.filter().endDate,
            limit: params.count(),
            offset: offset,
            sort: sort,
            order: params.sorting()[sort]
          }).then(function (data) {
            $scope.formSearch.setLoading(false);
            return data;
          });
        }
      });

      $scope.clearFilters = function () {
        $scope.tableParams.filter({ });
      }

      // search
      $scope.formSearch = {
        isLoading: false,
        setLoading: function(loading) {
          this.isLoading = loading;
        }
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
    }
]);