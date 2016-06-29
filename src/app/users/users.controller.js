'use strict';

var module = angular.module('supportAdminApp');

module.controller('users.UserSearchController', [
  '$log', '$scope', '$rootScope', '$timeout', '$state', '$uibModal', 'AuthService', 'UserService', 'Alert', 'users.Constants',
    function ($log, $scope, $rootScope, $timeout, $state, $modal, $authService, $userService, $alert, $const) {

      // footable
      angular.element(document).ready(function () {
        $('.footable').footable({
          addRowToggle: true
        });
      });
      
      $scope.$on('users.TableDataUpdated', function(event){
        $timeout(function(){
          $('.footable').trigger('footable_redraw');
        }, 100);
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
            $scope.$broadcast('users.TableDataUpdated');
          },
          function(error) {
            $alert.error(error.error, $scope);
            $scope.formSearch.setLoading(false);
          }
        );
      };
      
      // list
      $scope.users = [];

      // tooltip for activation link copy
      $scope.tooltip = {
        message : $const.MSG_CLIPBORD_TOOLTIP,

        success : function() {
          this.message = $const.MSG_CLIPBOARD_COPIED;
        },
        fail : function(err) {
          $log.debug(err);
        },
        reset : function() {
          $timeout(function(){ $scope.tooltip.message = $const.MSG_CLIPBORD_TOOLTIP; }, 250);
        }
      };

      $scope.activate = function(index) {
        $alert.clear();
        var user = $scope.users[index];
        if(!user.credential || !user.credential.activationCode) {
          $alert.error('The user \'' + user.handle + '\' is invalid. Unable to activate it.', $scope);
          return;
        };
        
        var confirmation = 'Are you sure you want to activate user \'' + user.handle + '\'?';
        if(!user.emailActive) {
          confirmation += '\nEmail address is also verified by the operation. Please confirm it\'s valid.';
        }
        if(window.confirm(confirmation)) {
          $scope.formSearch.setLoading(true);
          $userService.updateStatus(user.id, 'A').then(
            function(responseUser) {
              angular.copy(responseUser, user);
              $scope.formSearch.setLoading(false);
              $scope.$broadcast('users.TableDataUpdated');
            },
            function(error) {
              $alert.error(error.error, $scope);
              $scope.formSearch.setLoading(false);
            }
          );
        }
      };

      $scope.openDeactivateDialog = function(index) {
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
      
      $scope.openStatusHistoryDialog = function(index) {
        var modalInstance = $modal.open({
          size: 'sm',
          templateUrl: 'app/users/status-history-dialog.html',
          controller: 'users.StatusHistoryDialogController',
          resolve: {
				    user: function(){ return $scope.users[index]; }
			    }
        });
      };
      
    }
]);

module.controller('users.UserEditDialogController', [
  '$scope', '$rootScope', '$modalInstance', 'UserService', 'Alert', 'user',
    function ($scope, $rootScope, $modalInstance, $userService, $alert, user) {

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
              $scope.checkProfile()
              $scope.form.setLoading(false);
            },
            function(error) {
              $alert.error(error.error, $scope);
              $scope.form.setLoading(false);
            }
          );
        }
      };
      
      $scope.checkProfile = function() {
        $userService.getProfile($scope.form.handle).then(
          function(profile) {
              $modalInstance.close();
          },
          function(error) {
            if(error.status == 404) {
              $alert.error('The user\'s handle has been updated, but potentially failed to update profile with the new handle.\n' +
                          'Please check ' + $userService.getProfileEndpoint($scope.form.handle),
                          $scope);
            } else {
              $alert.error(error.error, $scope);
            }
          }
        );
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
  '$scope', '$rootScope', '$modalInstance', 'UserService', 'users.Constants', 'Alert', 'user',
    function ($scope, $rootScope, $modalInstance, $userService, $const, $alert, user) {

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
              angular.copy(responseUser, user);
              $scope.form.setLoading(false);
              $rootScope.$broadcast('users.TableDataUpdated');
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

module.controller('users.StatusHistoryDialogController', [
  '$scope', '$rootScope', '$modalInstance', 'UserService', 'users.Constants', 'Alert', 'user',
    function ($scope, $rootScope, $modalInstance, $userService, $const, $alert, user) {

      $scope.init = function() {
        $scope.achievements = [];
        $alert.clear();
        $scope.setLoading(true);
        $userService.getAchievements(user.id).then(
          function(achievements) {
            $scope.setLoading(false);
            if(!!achievements && achievements.length>0) {
              angular.forEach(achievements, function(achievement){
                if(achievement && achievement.typeId == 2) {
                  $scope.achievements.push(achievement);
                }
              });
            }
            if($scope.achievements.length==0) {
              $alert.info($const.MSG_NO_RECORD_FOUND, $scope);
            }
          },
          function(error) {
            $alert.error(error.error, $scope);
            $scope.setLoading(false);
          }
        );
      };

      $scope.isLoading = function() {
        return !!this.loading;
      };

      $scope.setLoading = function(loading) {
        return this.loading = !!loading;
      };

      $scope.close = function() {
        $modalInstance.close();
      };
      
      $scope.formatDate = function(isoDateText) {
        return isoDateText && isoDateText.substring(0, 10);
      };
    }
]);
