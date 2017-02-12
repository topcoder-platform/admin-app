'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.BillingAccountResourcesListController', ['$scope', '$rootScope', '$log',
  'billingaccountresources.Constants', 'BillingAccountResourceService', 'Alert', '$timeout', '$stateParams', '$state',
    function ($scope, $rootScope, $log, constants, BillingAccountResourceService, $alert, $timeout, $stateParams, $state) {

      $scope.billingAccountId = $stateParams.accountId;

      // footable
      angular.element(document).ready(function () {
        $('.footable').footable({
          empty: constants.MSG_NO_RECORD_FOUND
        });
      });

      $scope.$on('billingaccountresources.TableDataUpdated', function(event) {
        $timeout(function() {
          $('.footable').trigger('footable_redraw');
        });
      });

      // search
      $scope.formSearch = {
        isLoading: false,
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      // list data
      $scope.resources = [];

      /**
       * Search billing account resources
       * Current implementation will return list of all resources
       */
      $scope.search = function (accountId) {
        $alert.clear();
        $scope.formSearch.setLoading(true);
        BillingAccountResourceService.findAll(accountId).then(function (data) {
          $scope.resources = data;
          $scope.formSearch.setLoading(false);
          $scope.$broadcast('billingaccountresources.TableDataUpdated');
        }).catch(function (error) {
          $alert.error(error.error.message, $rootScope);
          $scope.formSearch.setLoading(false);
        });
      };

      /**
       * Delete the resource
       * @param  {String}       userId          the id of resource
       */
      $scope.deleteResource = function (userId) {
        BillingAccountResourceService.removeBillingAccountResource($scope.billingAccountId, userId).then(function () {
          $state.reload();
        }).catch(function (error) {
          $alert.error(error.error.message, $rootScope);
        });
      };

      if ($stateParams.accountId) {
        // load the resources on controller init
        $scope.search($stateParams.accountId);
      }
    }
]);