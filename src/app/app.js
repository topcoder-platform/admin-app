'use strict';

/**
 * support-admin-app
 */
angular.module('supportAdminApp', [
              'ngAnimate',
              'ngCookies',
              'ngTouch',
              'ngSanitize',
              'ngResource',
              'csvReader',
              'ui.router',
              'ui.bootstrap',
              'app.constants',
              'appirio-tech-ng-api-services',
              'appirio-tech-ng-auth',
              'ui.footable',
              'angular-clipboard'])
  // In the run phase of your Angular application
  .run(function($rootScope, $location, AuthService, $state, UserV3Service) {
    // Listen to '$locationChangeSuccess', not '$stateChangeStart'
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if(toState.name === "login") {
        return;
      }
      console.log('state changed. loggedIn: '+AuthService.isLoggedIn()); // debug
      if(!AuthService.isLoggedIn()) {
        $state.go('login');
      } else {
        UserV3Service.loadUser().then(function(currentUser) {
          $rootScope.currentUser = currentUser;
          $state.go(toState)
        });
      }
    })
  })
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider
        .state('login', {
           url: "/login",
           templateUrl: "app/login/login.html",
           data: { pageTitle: 'Login' }
        })
        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "components/common/content.html",
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "app/main/main.html",
            data: { pageTitle: 'Dashboard' }
        })
        .state('index.users', {
            url: "/users",
            templateUrl: "app/users/users.html",
            data: { pageTitle: 'User Management' }
        })
        .state('index.sso', {
            url: "/sso",
            templateUrl: "app/sso/sso.html",
            data: {pageTitle: 'SSO User Management' }
        });

    $urlRouterProvider.otherwise('/login');

    //$locationProvider.html5Mode(true).hashPrefix('!');
  })
;
