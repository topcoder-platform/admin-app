'use strict';

var module = angular.module('supportAdminApp');

module.controller('users.UserSearchController', [
  '$scope', '$rootScope', '$timeout', '$state', '$modal', 'AuthService','UserService',
    function ($scope, $rootScope, $timeout, $state, $modal, $authService, $userService) {

      // footable
      angular.element(document).ready(function () {
        $('.footable').footable({
            addRowToggle: true
        });
      });

      // auth
      $scope.authorized = function() {
        return $authService.isLoggedIn();
      }

      // search
      $scope.formSearch = {
        handle   : "",
        email    : "",
        status   : "",
        isLoading: false,
        getActive: function() {
          return this.status === "active" ? true :
                  this.status === "inactive" ? false :
                    null;
        },
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      $scope.search = function() {

        $scope.$broadcast('alert.ClearAll', {});

        var handle = $scope.formSearch.handle,
            email  = $scope.formSearch.email,
            active = $scope.formSearch.getActive(),
            like = false;

        var filter = '';
        if(handle) {
          like = handle.indexOf('*')>=0;
          filter += "handle="+handle;
        }
        if(email) {
          like = email.indexOf('*')>=0;
          if(filter.length>0)
            filter += '&';
          filter += "email="+email;
        }
        if(!(active === null) && !(active === undefined)) {
          if(filter.length>0)
            filter += '&';
          filter += "active="+active;
        }
        if(like) {
          filter += "&like="+like;
        }

        $scope.formSearch.setLoading(true);
        $userService.find(
          {filter : filter}
        ).then(
          function(users) {
            $scope.users = users;
            $scope.formSearch.setLoading(false);
            $timeout(function(){
              $('.footable').trigger('footable_redraw');
              }, 100);
          },
          function(error) {
            $scope.$broadcast('alert.AlertIssued', {type:'danger', message:error.error});
            $scope.formSearch.setLoading(false);
          }
        );
      };

      // list
      $scope.users = [];

      $scope.format = function(isoDateText) {
        return isoDateText && isoDateText.replace("T"," ").replace(".000Z","");
      };

      var statusLabels = {
        'A': 'Active',
        'U': 'Unverified',
        '4': 'Deactivated(User request)',
        '5': 'Deactivated(Duplicate account)',
        '6': 'Deactivated(Cheating account)'
      };
      $scope.statusLabel = function(status) {
        return statusLabels[status] || 'Unknown';
      };

      $scope.activate = function(index) {
        $scope.$broadcast('alert.ClearAll', {});
        var user = $scope.users[index];
        if(!user.credential || !user.credential.activationCode) {
          $scope.$broadcast('alert.AlertIssued',
            {type:'danger', message:'The user \'' + user.handle + '\' is invalid. Unable to activate it.'});
          return;
        };
        if(window.confirm('Are you sure you want to activate user \'' + user.handle + '\'?')) {
          $scope.formSearch.setLoading(true);
          $userService.activate(user.credential.activationCode).then(
            function(responseUser) {
              user.active = responseUser.active;
              user.status = responseUser.status;
              $scope.formSearch.setLoading(false);
            },
            function(error) {
              $scope.$broadcast('alert.AlertIssued', {type:'danger', message:error.error});
              $scope.formSearch.setLoading(false);
            }
          );
        }
      };

      $scope.openDeactivateDialog = function(index) {
        var user = $scope.users[index];

        //if(window.confirm('Are you sure you want to deactivate user \'' + user.handle + '\'?')) {
        var modalInstance = $modal.open({
          size: 'sm',
          templateUrl: 'app/users/status-update-dialog.html',
          controller: 'users.StatusUpdateDialogController',
          resolve: {
						user: function(){ return $scope.users[index]; }
					}
        });
      };

      $scope.openEditDialog = function(index) {
        var modalInstance = $modal.open({
          size: 'sm',
          templateUrl: 'app/users/user-edit-dialog.html',
          controller: 'users.UserEditDialogController',
          resolve: {
				    user: function(){ return $scope.users[index]; }
			    }
        });
      };
    }
]);

module.controller('users.UserEditDialogController', [
  '$scope', '$rootScope', '$timeout', '$state', '$modalInstance', 'AuthService', 'UserService', 'user',
    function ($scope, $rootScope, $timeout, $state, $modalInstance, $authService, $userService, user) {

      $scope.form = {
        id     : user.id,
        handle : user.handle,
        email  : user.email,
        active : user.active,
        firstName : user.firstName,
        lastName  : user.lastName,
        isLoading : false,
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      $scope.cancel = function() {
        $modalInstance.close();
      };

      $scope.save = function() {
        $scope.$broadcast('alert.ClearAll', {});
        if(window.confirm('Are you sure you want to save changes?')) {
          $scope.form.setLoading(true);
          // dummy
          setTimeout(function() {
            $scope.form.setLoading(false);
            user.handle = $scope.form.handle;
            user.email = $scope.form.email;
            user.firstName = $scope.form.firstName;
            user.lastName = $scope.form.lastName;
            $modalInstance.close();
          }, 1200);
        }
      }
    }
]);

module.controller('users.StatusUpdateDialogController', [
  '$scope', '$rootScope', '$timeout', '$state', '$modalInstance', 'AuthService', 'UserService', 'user',
    function ($scope, $rootScope, $timeout, $state, $modalInstance, $authService, $userService, user) {

      $scope.form = {
        status  : user.status,
        comment : null,
        isLoading : false,
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      $scope.cancel = function() {
        $modalInstance.close();
      };

      $scope.save = function() {
        $scope.$broadcast('alert.ClearAll', {});
        if(user.status === $scope.form.status) {
          $scope.$broadcast('alert.AlertIssued', {type:'danger', message:'Status not changed.'});
          return;
        }
        if(window.confirm('Are you sure you want to save changes?')) {
          $scope.form.setLoading(true);
          $userService.updateStatus(user.id, $scope.form.status, $scope.form.comment).then(
            function(responseUser) {
              user.active = responseUser.active;
              user.status = responseUser.status;
              $scope.form.setLoading(false);
              $modalInstance.close();
            },
            function(error) {
              $scope.$broadcast('alert.AlertIssued', {type:'danger', message:error.error});
              $scope.form.setLoading(false);
            }
          );

        }
      }
    }
]);
