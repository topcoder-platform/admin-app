'use strict';

//Directive used to set metisMenu and minimalize button
angular.module('supportAdminApp')
    .directive('sideNavigation', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                // Call metsi to build when user signup
                scope.$watch('authentication.user', function() {
                    $timeout(function() {
                        element.metisMenu();
                    });
                });

            }
        };
    })
    .directive('minimalizaSidebar', function ($timeout) {
        return {
            restrict: 'A',
            template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: function ($scope, $element) {
                $scope.minimalize = function () {
                    angular.element('body').toggleClass('mini-navbar');
                    if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
                        // Hide menu in order to smoothly turn on when maximize menu
                        angular.element('#side-menu').hide();
                        // For smoothly turn on menu
                        $timeout(function () {
                            angular.element('#side-menu').fadeIn(500);
                        }, 100);
                    } else {
                        // Remove all inline style from jquery fadeIn function to reset menu state
                        angular.element('#side-menu').removeAttr('style');
                    }
                };
            }
        };
    })
    .directive('findUser', function (UserService, Alert, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                element.on('blur', function () {
                    var handle = $(this).val();
                    if (handle && handle.length) {
                        UserService.find({
                            filter: 'handle=' + handle
                        }).then(function (data) {
                            var id = '';
                            if (data.length) {
                                id = data[0].id;
                            } else {
                                Alert.error('Can not find ID with handle : ' + handle, $rootScope);
                            }
                            scope.newResource.userId = id;
                        })
                    }
                });
            }
        };
    })
    // disable keyboard input event on single element
    .directive('disableKeyboard', function () {
        return {
            restrict: 'AE',
            link: function (scope, element, attributes) {                
                $(element).keypress(function (event) {                    
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                });
            }
        };
    })
    .directive('backButton', function($window) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs) {
                element.on('click', function() {
                    $window.history.back();
                });
            }
        }

    })
    // gets current phase according to a predefined logic, based on the phases array of a challenge
    .directive('currentPhase', function(moment) {
        return {
            restrict: 'AE',
            replace: true,
            template: '<span>{{phaseMessage}}</span>',
            scope: {
                challenge: '='
            },
            link: function(scope, element, attrs) {
                var statusPhase = null;

                if (scope.challenge.phases) {
                    statusPhase = scope.challenge.phases
                    .filter(function(p) {
                        return p.name !== 'Registration' && p.isOpen
                    })
                    .sort(function(a, b) {
                        return moment(a.scheduledEndDate).diff(b.scheduledEndDate);
                    })[0];
                }

                if (!statusPhase && scope.challenge.type === 'First2Finish' && scope.challenge.phases.length) {
                    statusPhase = _.clone(scope.challenge.phases[0]);
                    statusPhase.name = 'Submission';
                }

                scope.phaseMessage = "Stalled";
                if (statusPhase)
                    scope.phaseMessage = statusPhase.name;
                else if (scope.challenge.status === 'Draft')
                    scope.phaseMessage = "In Draft";
            }
        }
    });
