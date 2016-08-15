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
              'angular-clipboard',
              'ng-file-model',
              'ui.multiselect',
              'ui.bootstrap.datetimepicker',
              'angularMoment'])
  // In the run phase of your Angular application
  .run(function ($rootScope, $location, AuthService, $state, UserV3Service) {
    // Listen to '$locationChangeSuccess', not '$stateChangeStart'
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name === 'login') {
        return;
      }
      console.log('state changed. loggedIn: ' + AuthService.isLoggedIn()); // debug
      if (!AuthService.isLoggedIn()) {
        $state.go('login');
      } else {
        UserV3Service.loadUser().then(function (currentUser) {
          $rootScope.currentUser = currentUser;
          $state.go(toState, toParams);
        });
      }
    });
  })
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
      $stateProvider
        .state('login', {
           url: '/login',
           templateUrl: 'app/login/login.html',
           data: { pageTitle: 'Login' }
        })
        .state('index', {
            abstract: true,
            url: '/index',
            templateUrl: 'components/common/content.html'
        })
        .state('index.main', {
            url: '/main',
            templateUrl: 'app/main/main.html',
            data: { pageTitle: 'Dashboard' }
        })
        .state('index.users', {
            url: '/users',
            templateUrl: 'app/users/users.html',
            data: { pageTitle: 'User Management' }
        })
        .state('index.sso', {
            url: '/sso',
            templateUrl: 'app/sso/sso.html',
            data: { pageTitle: 'SSO User Management' }
        })
        .state('index.addmembers', {
            url: '/add',
            templateUrl: 'app/addmembers/add.html',
            data: { pageTitle: 'User Management' }
        })
        .state('index.submissions', {
            abstract: true,
            url: '/submissions',
            templateUrl: 'app/submissions/submissions.html',
            data: { pageTitle: 'Submissions' }
        })
        .state('index.submissions.list', {
            url: '/list',
            templateUrl: 'app/submissions/submissions.list.html',
            data: { pageTitle: 'Submissions List' },
            controller: 'SubmissionListCtrl'
        })
        .state('index.submissions.new', {
            url: '/new',
            templateUrl: 'app/submissions/submissions.new.html',
            controller: 'NewSubmissionCtrl',
            data: { pageTitle: 'New Submission' }
        })
        .state('index.tags', {
          abstract: true,
          url: '/tags',
          templateUrl: 'app/tags/tags.html',
          data: { pageTitle: 'Tags' },
          controller: function ($scope, $state) {
            $scope.$state = $state;
            $scope.tagDomains = [{
              value: 'skills',
              name: 'Skills'
            }, {
              value: 'events',
              name: 'Events'
            }];

            $scope.tagCategories = [{
              value: 'data_science',
              name: 'Data Science'
            }, {
              value: 'develop',
              name: 'Develop'
            },
              {
                value: 'design',
                name: 'Design'
              }];

            $scope.tagStatuses = [{
              value: 'approved',
              name: 'Approved'
            }, {
              value: 'pending',
              name: 'Pending'
            }];
          }
        })
        .state('index.tags.list', {
          url: '/list',
          templateUrl: 'app/tags/tags.list.html',
          controller: 'TagListCtrl'
        })
        .state('index.tags.new', {
          url: '/new',
          templateUrl: 'app/tags/tags.new.html',
          controller: 'NewTagCtrl',
          data: { pageTitle: 'New Tag' }
        })
        .state('index.tags.edit', {
          url: '/edit/:tagId',
          templateUrl: 'app/tags/tags.edit.html',
          controller: 'EditTagCtrl',
          data: { pageTitle: 'Edit Tag' }
        })
        .state('index.work', {
          abstract: true,
          url: '/work',
          templateUrl: 'app/work/work.html',
          data: { pageTitle: 'Work Items Management' }
        })
        .state('index.work.list', {
          url: '/list/:id',
          views: {
            'work-details': {
              templateUrl: 'app/work/work.details.html'
            },
            'work-list': {
              templateUrl: 'app/work/work.list.html',
              data: { pageTitle: 'work List' },
              controller: 'WorkListCtrl',
              params: {
                id: ''
              }
            },
            'work-messages': {
              templateUrl: 'app/work/work.messages.html',
              controller: 'projectController'
            }
          }
        })
        .state('index.workStepEdit', {
          url: '/work/:id/:stepId',
          templateUrl: 'app/work/workStepEdit.html',
          data: { pageTitle: 'Edit Step' },
          controller: 'WorkStepEditCtrl',
          params: {
            id: '',
            stepId: ''
          }
        })
        .state('index.projects', {
          url: '/projects',
          templateUrl: 'app/work/projects.html',
          data: { pageTitle: 'Projects List' },
          controller: 'ProjectListCtrl',
          controllerAs: 'vm'
        });

    $urlRouterProvider.otherwise('/login');
    // $locationProvider.html5Mode(true).hashPrefix('!');
  });
