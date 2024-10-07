'use strict';

var module = angular.module('supportAdminApp');

module.controller('admintool.AdminToolController', [
  '$scope', '$timeout', '$uibModal', 'AuthService', 'AdminToolService', 'Alert', 'admintool.Constants',
  function ($scope, $timeout, $modal, $authService, $adminToolService, $alert, $const) {
    $scope.users = [];
    $scope.reviewBoardProjectCategories = [];
    $scope.constRoles = $const.Roles;
    // search
    $scope.formSearch = {
      handle: '',
      role: '',
      categoryId: '',
      isLoading: false,
      usersFound: false,
      reviewBoardProjectCategoriesFound: false,
      isAdmin: function () {
        return this.role === $const.Roles.Admin;
      },
      isCopilot: function () {
        return this.role === $const.Roles.Copilot;
      },
      isReviewer: function () {
        return this.role === $const.Roles.Reviewer;
      },
      setLoading: function (loading) {
        this.isLoading = loading;
      }
    };


    $scope.$on('adminTools.TableDataUpdated', function () {
      $timeout(function () {
        $('.footable').trigger('footable_redraw');
      }, 100);
    });


    // auth
    $scope.authorized = function () {
      return $authService.isLoggedIn();
    };

    $scope.changeRole = function () {
      $scope.users = [];
      $scope.formSearch.usersFound = false;
      $alert.clear();
    };

    // search users with role input and will use client side filter for handle
    $scope.search = function (notClear) {
      if (!notClear) {
        $alert.clear();
      }

      var handle = $scope.formSearch.handle, role = $scope.formSearch.role;

      $scope.formSearch.setLoading(true);
      var searchMethod = $scope.formSearch.isReviewer() ?
        $adminToolService.findReviewers($scope.formSearch.categoryId)
        : $adminToolService['find' + role + 's']();
      searchMethod.then(
        function (users) {
          if (handle) {
            users = users.filter(function (user) {
              // filter handle with case insensitive
              return angular.lowercase(user.name) === angular.lowercase(handle);
            });
          }
          $scope.users = users;
          $scope.formSearch.setLoading(false);
          $scope.formSearch.usersFound = true;
          $scope.$broadcast('adminTools.TableDataUpdated');
        },
        function (error) {
          $alert.error(error.error, $scope);
          $scope.formSearch.setLoading(false);
        }
      );
    };

    $scope.formSearch.setLoading(true);
    $adminToolService.findReviewBoardProjectCategories().then(function (projectCategories) {
        projectCategories = projectCategories.sort(function (p1, p2) {
          return p1.name.localeCompare(p2.name);
        });
        $scope.reviewBoardProjectCategories = projectCategories;
        $scope.formSearch.setLoading(false);
      },
      function (error) {
        $alert.error(error.error, $scope);
        $scope.formSearch.setLoading(false);
      });

    // open remove user role dialog
    $scope.openRemoveUserRoleDialog = function (index) {
      $modal.open({
        size: 'sm',
        templateUrl: 'app/admintool/remove-user-role-dialog.html',
        controller: 'admintool.RemoveUserRoleDialogController',
        resolve: {
          user: function () {
            return $scope.users[index];
          },
          role: function () {
            return $scope.formSearch.role;
          }
        }
      }).result.then(function (result) {
        $alert.info(result.message);
        $scope.search(true);
      });
    };

    // open new user role dialog
    $scope.openNewUserRoleDialog = function () {
      $modal.open({
        size: 'sm',
        templateUrl: 'app/admintool/user-role-dialog.html',
        controller: 'admintool.NewUserRoleDialogController',
        resolve: {
          role: function () {
            return $scope.formSearch.role;
          },
          categoryId: function () {
            return $scope.formSearch.categoryId;
          },
          reviewBoardProjectCategories: function () {
            return $scope.reviewBoardProjectCategories;
          }
        }
      }).result.then(function (result) {
        $scope.formSearch.role = result.role;
        if ($scope.formSearch.isReviewer()) {
          $scope.formSearch.categoryId = result.categoryId;
        }
        $alert.info(result.message);
        $scope.search(true);
      });
    };

    // open edit user role dialog
    $scope.openEditUserRoleDialog = function (index) {
      $modal.open({
        size: 'sm',
        templateUrl: 'app/admintool/user-role-dialog.html',
        controller: 'admintool.EditUserRoleDialogController',
        resolve: {
          user: function () {
            return $scope.users[index];
          },
          role: function () {
            return $scope.formSearch.role;
          },
          categoryId: function () {
            return $scope.formSearch.categoryId;
          },
          reviewBoardProjectCategories: function () {
            return $scope.reviewBoardProjectCategories;
          }
        }
      }).result.then(function (result) {
        if ($scope.formSearch.isReviewer()) {
          $scope.formSearch.categoryId = result.categoryId;
        }
        $alert.info($scope.formSearch.role + ' ' + result.name + ' has been successfully updated!');
        $scope.search(true);
      });
    };

  }
]);
module.controller('admintool.RemoveUserRoleDialogController', [
  '$scope', '$uibModalInstance', 'AdminToolService', 'Alert', 'user', 'role', 'admintool.Constants',
  function ($scope, $modalInstance, $adminToolService, $alert, user, role, $const) {
    $scope.form = {
      user: user,
      role: role,
      isLoading: false,
      setLoading: function (loading) {
        this.isLoading = loading;
      },
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    $scope.remove = function () {
      $alert.clear();
      $scope.form.setLoading(true);
      var data = {
        username: user.name
      };
      if (role === $const.Roles.Reviewer) {
        data.categoryId = user.projectCategoryId;
      }
      $adminToolService['delete' + role](data).then(
        function (result) {
          $scope.form.setLoading(false);
          $modalInstance.close(result);
        },
        function (error) {
          $alert.error(error.error, $scope);
          $scope.form.setLoading(false);
        }
      );
    };
  }
]);

module.controller('admintool.NewUserRoleDialogController', [
  '$scope', '$uibModalInstance', 'AdminToolService', 'Alert', 'role', 'categoryId', 'reviewBoardProjectCategories',
  'admintool.Constants',
  function ($scope, $modalInstance, $adminToolService, $alert, role, categoryId, reviewBoardProjectCategories, $const) {
    $scope.reviewBoardProjectCategories = reviewBoardProjectCategories;
    $scope.constRoles = $const.Roles;
    $scope.form = {
      role: role,
      user: {
        username: ''
      },
      isCopilot: function () {
        return this.role === $const.Roles.Copilot;
      },
      isReviewer: function () {
        return this.role === $const.Roles.Reviewer;
      },
      isLoading: false,
      setLoading: function (loading) {
        this.isLoading = loading;
      }
    };
    if ($scope.form.isCopilot()) {
      $scope.form.user.isSoftwareCopilot = false;
      $scope.form.user.isStudioCopilot = false;
    } else if ($scope.form.isReviewer()) {
      $scope.form.user.categoryId = categoryId;
      $scope.form.editImmune = false;
    }

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    $scope.ok = function (form) {
      if (!form.$valid) {
        return;
      }
      $alert.clear();
      $scope.form.setLoading(true);
      var newUser = angular.copy($scope.form.user);
      if ($scope.form.isCopilot()) {
        newUser.isSoftwareCopilot = !!newUser.isSoftwareCopilot;
        newUser.isStudioCopilot = !!newUser.isStudioCopilot;
      } else if ($scope.form.isReviewer()) {
        if ($scope.form.editImmune) {
          newUser.immune = !!newUser.immune;
        } else {
          delete newUser.immune;
        }
      }

      $adminToolService['create' + $scope.form.role](newUser).then(
        function (result) {
          $scope.form.setLoading(false);
          result.role = $scope.form.role;
          if ($scope.form.isReviewer()) {
            result.categoryId = newUser.categoryId;
          }
          $modalInstance.close(result);
        },
        function (error) {
          $alert.error(error.error, $scope);
          $scope.form.setLoading(false);
        }
      );
    };
  }
]);

module.controller('admintool.EditUserRoleDialogController', [
  '$scope', '$uibModalInstance', 'AdminToolService', 'Alert', 'user', 'role', 'categoryId', 'reviewBoardProjectCategories', 'admintool.Constants',
  function ($scope, $modalInstance, $adminToolService, $alert, user, role, categoryId, reviewBoardProjectCategories, $const) {
    $scope.reviewBoardProjectCategories = reviewBoardProjectCategories;
    $scope.constRoles = $const.Roles;
    $scope.form = {
      role: role,
      user: {
        id: user.id,
        username: user.name
      },
      isCopilot: function () {
        return this.role === $const.Roles.Copilot;
      },
      isReviewer: function () {
        return this.role === $const.Roles.Reviewer;
      },
      isLoading: false,
      setLoading: function (loading) {
        this.isLoading = loading;
      }
    };

    if ($scope.form.isCopilot()) {
      $scope.form.user.isSoftwareCopilot = user.softwareCopilot;
      $scope.form.user.isStudioCopilot = user.studioCopilot;
    } else if ($scope.form.isReviewer()) {
      $scope.form.user.categoryId = categoryId;
      $scope.form.user.immune = user.immune;
      $scope.form.editImmune = true;
    }

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    $scope.ok = function (form) {
      if (!form.$valid) {
        return;
      }
      $alert.clear();
      $scope.form.setLoading(true);
      var updatedUser = angular.copy($scope.form.user);
      var updateMethod = null;
      if ($scope.form.isCopilot()) {
        if (updatedUser.isSoftwareCopilot === user.softwareCopilot
          && updatedUser.isStudioCopilot === user.studioCopilot) {
          // no updates
          $modalInstance.close(user);
          return;
        }
        updateMethod = $adminToolService.updateCopilot(updatedUser);
      }
      if ($scope.form.isReviewer()) {
        if ($scope.form.editImmune) {
          updatedUser.immune = !!updatedUser.immune;
        } else {
          // reset to old value
          updatedUser.immune = user.immune;
        }
        if (updatedUser.categoryId === categoryId
          && updatedUser.immune === user.immune) {
          user.categoryId = categoryId;
          // no updates
          $modalInstance.close(user);
          return;
        }
        updateMethod = $adminToolService.updateReviewer({
          username: user.name,
          categoryId: categoryId
        }, updatedUser);
      }
      updateMethod.then(
        function () {
          $scope.form.setLoading(false);
          if ($scope.form.isCopilot()) {
            user.softwareCopilot = updatedUser.isSoftwareCopilot;
            user.studioCopilot = updatedUser.isStudioCopilot;
          } else if ($scope.form.isReviewer()) {
            user.immune = updatedUser.immune;
            user.categoryId = updatedUser.categoryId;
          }
          $modalInstance.close(user);
        },
        function (error) {
          $scope.form.setLoading(false);
          $alert.error(error.error, $scope);
        }
      );
    };
  }
]);

