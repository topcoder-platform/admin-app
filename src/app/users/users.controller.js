'use strict';

var module = angular.module('supportAdminApp');

module.controller('users.UserSearchController', [
  '$log', '$scope', '$rootScope', '$timeout', '$state', '$modal', 'AuthService','UserService', 'Alert',
    function ($log, $scope, $rootScope, $timeout, $state, $modal, $authService, $userService, $alert) {

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

        $alert.clear();

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
            $alert.error(error.error, $scope);
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
        $alert.clear();
        var user = $scope.users[index];
        if(!user.credential || !user.credential.activationCode) {
          $alert.error('The user \'' + user.handle + '\' is invalid. Unable to activate it.', $scope);
          return;
        };
        if(window.confirm('Are you sure you want to activate user \'' + user.handle + '\'?')) {
          $scope.formSearch.setLoading(true);
          $userService.updateStatus(user.id, 'A').then(
            function(responseUser) {
              user.active = responseUser.active;
              user.status = responseUser.status;
              $scope.formSearch.setLoading(false);
            },
            function(error) {
              $alert.error(error.error, $scope);
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

      $scope.openHandleEditDialog = function(index) {
        var modalInstance = $modal.open({
          size: 'sm',
          templateUrl: 'app/users/handle-edit-dialog.html',
          controller: 'users.UserEditDialogController',
          resolve: {
				    user: function(){ return $scope.users[index]; }
			    }
        });
      };
      
      $scope.openEmailEditDialog = function(index) {
        var modalInstance = $modal.open({
          size: 'sm',
          templateUrl: 'app/users/email-edit-dialog.html',
          controller: 'users.UserEditDialogController',
          resolve: {
				    user: function(){ return $scope.users[index]; }
			    }
        });
      };
      
    }
]);

module.controller('users.UserEditDialogController', [
  '$scope', '$rootScope', '$timeout', '$state', '$modalInstance', 'AuthService', 'UserService', 'Alert', 'user',
    function ($scope, $rootScope, $timeout, $state, $modalInstance, $authService, $userService, $alert, user) {

      $scope.user = user;
      
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

      $scope.saveHandle = function() {
        $alert.clear();
        if(user.handle === $scope.form.handle) {
          $alert.error('Handle is not changed.', $scope);
          return;
        }
        
        if(window.confirm('Are you sure you want to save changes?')) {
          $scope.form.setLoading(true);
          $userService.updateHandle(user.id, $scope.form.handle).then(
            function(responseUser) {
              user.handle = responseUser.handle;
              $scope.form.setLoading(false);
              $modalInstance.close();
            },
            function(error) {
              $alert.error(error.error, $scope);
              $scope.form.setLoading(false);
            }
          );
        }
      };
      
      $scope.saveEmail = function() {
        $alert.clear();
        if(user.email.toLowerCase() === $scope.form.email.toLowerCase()) {
          $alert.error('Email is not changed.', $scope);
          return;
        }
        
        if(window.confirm('Are you sure you want to save changes?')) {
          $scope.form.setLoading(true);
          $userService.updateEmail(user.id, $scope.form.email).then(
            function(responseUser) {
              user.email = responseUser.email;
              $scope.form.setLoading(false);
              $modalInstance.close();
            },
            function(error) {
              $alert.error(error.error, $scope);
              $scope.form.setLoading(false);
            }
          );
        }
      };
      
    }
]);

module.controller('users.StatusUpdateDialogController', [
  '$scope', '$rootScope', '$timeout', '$state', '$modalInstance', 'AuthService', 'UserService', 'Alert', 'user',
    function ($scope, $rootScope, $timeout, $state, $modalInstance, $authService, $userService, $alert, user) {

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
        $alert.clear();
        if(user.status === $scope.form.status) {
          $alert.error('Status is not changed.', $scope);
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
              $alert.error(error.error, $scope);
              $scope.form.setLoading(false);
            }
          );
        }
      };
      
    }
]);
