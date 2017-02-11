'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.ClientsListController', ['$scope', '$rootScope', '$log', 'clients.Constants',
  'ClientService', 'Alert', '$timeout',
    function ($scope, $rootScope, $log, constants, ClientService, $alert, $timeout) {
      // footable
      angular.element(document).ready(function () {
        $('.footable').footable({
          empty: constants.MSG_NO_RECORD_FOUND
        });
      });

      $scope.$on('clients.TableDataUpdated', function(event) {
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
      $scope.clients = [];

      /**
       * Search clients
       * Current implementation will return list of all clients
       */
      $scope.search = function () {
        $alert.clear();
        $scope.formSearch.setLoading(true);
        ClientService.findAll().then(function (data) {
          $scope.clients = data.clients;
          $scope.formSearch.setLoading(false);
          $scope.$broadcast('clients.TableDataUpdated');
        }).catch(function (error) {
          $alert.error(error.error.message, $rootScope);
          $scope.formSearch.setLoading(false);
        });
      };

      // load the clients on controller init
      $scope.search();
    }
]);