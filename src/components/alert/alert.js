'use strict';

angular.module('supportAdminApp')
  .factory('Alert', ['$log', '$rootScope',
    function ($log, $rootScope) {
      
      var Alert = function(type, message) {
        this.type = type;
        this.message = message;
      };
      
      Alert.prototype.style = function() {
        if (this.type == 'error')
					return 'danger';
				if (this.type == 'debug')
					return 'info';
				return this.type;
      };
      
      Alert.issue = function(alert, $scope) {
        $log.debug('Alert#alert::type:'+alert.type+',message:'+alert.message);
        var scope = $scope || $rootScope
		    scope.$broadcast('alert.AlertIssued', alert);
      };
      
      Alert.info = function(message, $scope) {
        Alert.issue(new Alert('info', message), $scope);
      };
      
      Alert.warning = function(message, $scope) {
        Alert.issue(new Alert('warning', message), $scope);
      };
      
      Alert.error = function(message, $scope) {
        Alert.issue(new Alert('error', message), $scope);
      };

      Alert.clear = function($scope) {
        var scope = $scope || $rootScope
        scope.$broadcast('alert.ClearAll', {});
      };
      
      return Alert;
    }
  ]);
