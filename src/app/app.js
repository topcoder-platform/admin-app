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
    'angular-clipboard',
    'ng-file-model',
    'btorfs.multiselect',
    'ui.bootstrap.datetimepicker',
    'angularMoment',
    'angular-jwt'])
  // In the run phase of your Angular application
  .run(function (AuthService) {
    // init AuthService, it has to be done once, when app starts
    AuthService.init();
  })
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
    var authenticate = ['AuthService', '$q', '$state', function(AuthService, $q, $state) {
      return AuthService.authenticate().catch(function(err) {
        // if we get error that use doesn't have permissions
        // then go to auth page, which will show permissions denied error
        if (err === AuthService.ERROR.NO_PERMISSIONS) {
          $state.go('auth');
        }
        return $q.reject();
      });
    }];

    $stateProvider
      .state('auth', {
        url: '/auth',
        templateUrl: 'app/auth/auth.html',
        data: { pageTitle: 'Authentication' },
        resolve: {
          auth: ['AuthService', '$q', function(AuthService, $q) {
            // for auth state we use another resolver then all other states
            return AuthService.authenticate().catch(function(err) {
              // if we get error that use doesn't have permissions
              // we still resolve the promise and proceed to auth page
              // which will show permissions denied error
              // also we keep going if we are in loging out process
              if (err === AuthService.ERROR.NO_PERMISSIONS || AuthService.logginOut) {
                return $q.resolve();
              }
              return $q.reject();
            });
          }]
        }
      })
      .state('index', {
        abstract: true,
        url: '/index',
        templateUrl: 'components/common/content.html'
      })
      .state('index.main', {
        url: '/main',
        templateUrl: 'app/main/main.html',
        data: { pageTitle: 'Dashboard' },
        resolve: { auth: authenticate }
      })
      .state('index.users', {
        url: '/users',
        templateUrl: 'app/users/users.html',
        data: { pageTitle: 'User Management' },
        resolve: { auth: authenticate }
      })
      .state('index.admintool', {
        url: '/admintool',
        templateUrl: 'app/admintool/admintool.html',
        data: { pageTitle: 'Admins / Copilots / Reviewers  Management' },
        resolve: { auth: authenticate }
      })
      .state('index.sso', {
        url: '/sso',
        templateUrl: 'app/sso/sso.html',
        data: { pageTitle: 'SSO User Management' },
        resolve: { auth: authenticate }
      })
      .state('index.addmembers', {
        url: '/add',
        templateUrl: 'app/addmembers/add.html',
        data: { pageTitle: 'User Management' },
        resolve: { auth: authenticate }
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
        controller: 'SubmissionListCtrl',
        resolve: { auth: authenticate }
      })
      .state('index.submissions.new', {
        url: '/new',
        templateUrl: 'app/submissions/submissions.new.html',
        controller: 'NewSubmissionCtrl',
        data: { pageTitle: 'New Submission' },
        resolve: { auth: authenticate }
      })
      .state('index.tags', {
        abstract: true,
        url: '/tags',
        templateUrl: 'app/tags/tags.html',
        data: { pageTitle: 'Tags' },
        controller: function ($scope, $state, TagService) {
          $scope.$state = $state;
          $scope.tagDomains = [{
            value: 'skills',
            name: 'Skills'
          }, {
            value: 'events',
            name: 'Events'
          }, {
            value: 'technology',
            name: 'Technology'
          }, {
            value: 'platform',
            name: 'Platform'
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

          TagService.getTechnologyStatuses().then(function(techStatuses) {
            _.forEach(techStatuses, function(status) {
              status.value = _.lowerCase(status.description);
              status.name = status.description;
            });
            $scope.techStatuses = techStatuses;
          });
          $scope.getTagStatuses = function(domainType) {
            if (domainType === 'technology') {
              return $scope.techStatuses;
            } else {
              return $scope.tagStatuses;
            }
          }
        }
      })
      .state('index.tags.list', {
        url: '/list',
        templateUrl: 'app/tags/tags.list.html',
        controller: 'TagListCtrl',
        resolve: { auth: authenticate }
      })
      .state('index.tags.new', {
        url: '/new',
        templateUrl: 'app/tags/tags.new.html',
        controller: 'NewTagCtrl',
        data: { pageTitle: 'New Tag' },
        resolve: { auth: authenticate }
      })
      .state('index.tags.edit', {
        url: '/edit/:tagId',
        templateUrl: 'app/tags/tags.edit.html',
        controller: 'EditTagCtrl',
        data: { pageTitle: 'Edit Tag' },
        resolve: { auth: authenticate }
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
        },
        resolve: { auth: authenticate }
      })
      .state('index.workStepEdit', {
        url: '/work/:id/:stepId',
        templateUrl: 'app/work/workStepEdit.html',
        data: { pageTitle: 'Edit Step' },
        controller: 'WorkStepEditCtrl',
        params: {
          id: '',
          stepId: ''
        },
        resolve: { auth: authenticate }
      })
      .state('index.projects', {
        url: '/projects',
        templateUrl: 'app/work/projects.html',
        data: { pageTitle: 'Projects List' },
        controller: 'ProjectListCtrl',
        controllerAs: 'vm',
        resolve: { auth: authenticate }
      })
      .state('index.clients', {
        abstract: true,
        url: '/clients',
        templateUrl: 'app/clients/clients.html',
        data: { pageTitle: 'Clients' },
        controller: 'billingaccount.ClientsController'
      })
      .state('index.clients.list', {
        url: '/list',
        templateUrl: 'app/clients/clients.list.html',
        controller: 'billingaccount.ClientsListController',
        resolve: { auth: authenticate }
      })
      .state('index.clients.new', {
        url: '/new',
        templateUrl: 'app/clients/clients.new.html',
        controller: 'billingaccount.NewClientController',
        data: { pageTitle: 'New Client' },
        resolve: { auth: authenticate }
      })
      .state('index.clients.edit', {
        url: '/edit/:clientId',
        templateUrl: 'app/clients/clients.edit.html',
        controller: 'billingaccount.EditClientController',
        data: { pageTitle: 'Edit Client' },
        resolve: { auth: authenticate }
      })
      .state('index.groups', {
        abstract: true,
        url: '/groups',
        templateUrl: 'app/groups/groups.html',
        data: { pageTitle: 'Groups' },
        controller: 'permissionmanagement.GroupsController'
      })
      .state('index.groups.list', {
        url: '/list',
        templateUrl: 'app/groups/groups.list.html',
        controller: 'permissionmanagement.GroupsListController',
        resolve: { auth: authenticate }
      })
      .state('index.groupmembers', {
        abstract: true,
        url: '/groupmembers/:groupId',
        templateUrl: 'app/groupmembers/groupmembers.html',
        data: { pageTitle: 'Group Members' },
        controller: 'permissionmanagement.GroupMembersController'
      })
      .state('index.groupmembers.list', {
        url: '/list',
        templateUrl: 'app/groupmembers/groupmembers.list.html',
        controller: 'permissionmanagement.GroupMembersListController',
        resolve: { auth: authenticate }
      })
      .state('index.groupmembers.new', {
        url: '/new',
        templateUrl: 'app/groupmembers/groupmembers.new.html',
        controller: 'permissionmanagement.GroupMembersNewController',
        data: { pageTitle: 'Add Group Members' },
        resolve: { auth: authenticate }
      })
      .state('index.roles', {
        abstract: true,
        url: '/roles',
        templateUrl: 'app/roles/roles.html',
        data: { pageTitle: 'Roles' },
        controller: 'permissionmanagement.RolesController'
      })
      .state('index.roles.list', {
        url: '/list',
        templateUrl: 'app/roles/roles.list.html',
        data: { pageTitle: 'Roles' },
        controller: 'permissionmanagement.RolesListController',
        controllerAs: 'ctrl',
        resolve: { auth: authenticate }
      })
      .state('index.rolemembers', {
        abstract: true,
        url: '/rolemembers/:roleId',
        templateUrl: 'app/rolemembers/rolemembers.html',
        data: { pageTitle: 'Role Members' },
        controller: 'permissionmanagement.RoleMembersController'
      })
      .state('index.rolemembers.list', {
        url: '/list',
        templateUrl: 'app/rolemembers/rolemembers.list.html',
        controller: 'permissionmanagement.RoleMembersListController',
        resolve: { auth: authenticate }
      })
      .state('index.rolemembers.new', {
        url: '/new',
        templateUrl: 'app/rolemembers/rolemembers.new.html',
        controller: 'permissionmanagement.RoleMembersNewController',
        data: { pageTitle: 'Add Role Members' },
        resolve: { auth: authenticate }
      })
      .state('index.billingaccounts', {
        abstract: true,
        url: '/billingaccounts',
        templateUrl: 'app/billing_accounts/billingaccounts.html',
        data: { pageTitle: 'Billing Accounts' },
        controller: 'billingaccount.BillingAccountsController'
      })
      .state('index.billingaccounts.list', {
        url: '/list',
        templateUrl: 'app/billing_accounts/billingaccounts.list.html',
        controller: 'billingaccount.BillingAccountsListController',
        resolve: { auth: authenticate }
      })
      .state('index.billingaccounts.new', {
        url: '/new',
        templateUrl: 'app/billing_accounts/billingaccounts.new.html',
        controller: 'billingaccount.NewBillingAccountController',
        data: { pageTitle: 'New Billing Account' },
        resolve: { auth: authenticate }
      })
      .state('index.billingaccounts.edit', {
        url: '/edit/:accountId',
        templateUrl: 'app/billing_accounts/billingaccounts.edit.html',
        controller: 'billingaccount.EditBillingAccountController',
        data: { pageTitle: 'Edit Billing Account' },
        resolve: { auth: authenticate }
      })
      .state('index.billingaccounts.view', {
        url: '/view/:accountId',
        templateUrl: 'app/billing_accounts/billingaccounts.view.html',
        controller: 'billingaccount.ViewBillingAccountController',
        data: { pageTitle: 'Details - Billing Account' },
        resolve: { auth: authenticate }
      })
      .state('index.billingaccountresources', {
        abstract: true,
        url: '/billingaccountresources',
        templateUrl: 'app/billing_account_resources/billingaccountresources.html',
        data: { pageTitle: 'Billing Account Resources' },
        controller: 'billingaccount.BillingAccountResourcesController'
      })
      .state('index.billingaccountresources.list', {
        url: '/list/:accountId',
        templateUrl: 'app/billing_account_resources/billingaccountresources.list.html',
        controller: 'billingaccount.BillingAccountResourcesListController',
        resolve: { auth: authenticate }
      })
      .state('index.billingaccountresources.new', {
        url: '/:accountId/new',
        templateUrl: 'app/billing_account_resources/billingaccountresources.new.html',
        controller: 'billingaccount.NewBillingAccountResourceController',
        data: { pageTitle: 'New Billing Account Resource' },
        resolve: { auth: authenticate }
      })
      .state('index.challenges', {
        url: 'challenges',
        templateUrl: 'app/challenges/challenges.html',
        data: { pageTitle: 'Challenge Management'},
        resolve: { auth: authenticate }
      })
      .state('index.ideas', {
        abstract: true,
        url: '/ideas',
        templateUrl: 'app/ideas/ideas.html',
        data: { pageTitle: 'Spigit' },
        controller: 'IdeasController'
      })
      .state('index.ideas.list', {
        url: '/list',
        templateUrl: 'app/ideas/ideas.list.html',
        data: { pageTitle: 'Spigit - Idea List' },
        controller: 'IdeaListController',
        resolve: { auth: authenticate }
      });

    $urlRouterProvider.otherwise('/index/main');
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
  });
