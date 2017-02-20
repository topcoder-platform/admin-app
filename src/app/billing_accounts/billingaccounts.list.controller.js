'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.BillingAccountsListController', ['$scope', '$rootScope', '$log',
  'BillingAccountService', 'Alert', '$timeout', 'billingaccounts.Constants',
    function ($scope, $rootScope, $log, BillingAccountService, $alert, $timeout, constants) {

      // footable
      angular.element(document).ready(function () {
        $('.footable').footable({
          empty: constants.MSG_NO_RECORD_FOUND
        });
      });

      $scope.$on('billingaccounts.TableDataUpdated', function(event) {
        $timeout(function() {
          $('.footable').trigger('footable_redraw');
        });
      });

      // search
      $scope.formSearch = {
        isLoading: false,
        criteria: { },
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      // list data
      $scope.accounts = [];

      $scope.search = function () {
        BillingAccountService.search({
          customer: $scope.formSearch.criteria.customer,
          user: $scope.formSearch.criteria.user,
          status: $scope.formSearch.criteria.status,
          startDate: $scope.formSearch.criteria.startDate,
          endDate: $scope.formSearch.criteria.endDate,
          limit: 100000,        // some very huge limit
        }).then(function (data) {
          $scope.formSearch.setLoading(false);
          $scope.accounts = data;
          $scope.$broadcast('billingaccounts.TableDataUpdated');
        }).catch(function (error) {
          $scope.formSearch.setLoading(false);
          $alert.error(error.error.message, $rootScope);
        });
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