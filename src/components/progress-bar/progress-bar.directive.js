

(function() {
  'use strict'

  angular.module('supportAdminApp').directive('progressBar', progressBar)

  progressBar.$inject = ['$parse']

  function progressBar($parse) {
    return {
      restrict: 'E',
      templateUrl: 'components/progress-bar/progress-bar.directive.html',
      link: function(scope, element, attr) {
        var model = $parse(attr.completed)
        var msg = attr.message
        var progress = angular.element(element[0].querySelector('.progress-bar__bar--completed'))

        scope.$watch(model, function(newValue, oldValue) {
          scope.completed = Math.round(newValue)
          scope.message = msg
        })
      }
    }
  }
})()
