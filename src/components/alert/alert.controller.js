var module = angular.module('supportAdminApp');

module.controller('AlertController', ['$scope', '$rootScope',
    function ($scope, $rootScope) {

      $scope.alerts = [];

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.addAlert = function(alert) {
        $scope.alerts.push(alert);
      };

      $scope.$on('alert.AlertIssued', function(event, alert){
        $scope.addAlert(alert);
			});

      $scope.$on('alert.ClearAll', function(event, alert){
        $scope.alerts.length = 0;
      });
    }
  ]);
