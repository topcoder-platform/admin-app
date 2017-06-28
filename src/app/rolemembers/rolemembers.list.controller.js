'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.RoleMembersListController', [
              '$scope', '$rootScope', 'RoleService', 'IdResolverService', '$stateParams', '$state', '$q', 'Alert', '$timeout',
    function ($scope, $rootScope, RoleService, IdResolverService, $stateParams, $state, $q, $alert, $timeout) {

      // true if role is loading
      $scope.isLoading = false;

      // true if we are removing a bulk of entries
      $scope.isProcessing = false;

      // list of members
      $scope.members = [];

      // current role object
      $scope.role = null;

      // true if any members were selected in the list
      $scope.hasSelected = false;

      // if checkbox in table header is selected
      $scope.isAllSelected = false;

      // keep the list of members visible on the current page
      var currentPageMembers = [];

      /* Maps user ids, present in the page, into user handles. */
      $scope.users = {};
      var loadUser = IdResolverService.getUserResolverFunction($scope.users);

      /**
       * Return members which are selected in the table by checkboxes
       *
       * @return {Array} member records
       */
      function getSelectedMembers() {
        // return only members selected on the current page
        // to make 100% sure we never delete members we cannot see
        return _.filter(currentPageMembers, { isSelected: true });
      }

      /**
       * Get role with members list
       *
       * @param  {String} roleId role id to get
       */
      $scope.loadRole = function(roleId) {
        $alert.clear();
        $scope.isLoading = true;

        RoleService.getRole(roleId, ['id', 'roleName', 'subjects']).then(function(role) {
          $scope.role = role;
          $scope.members = $scope.role.subjects.map(function(memberId) {
            return {
              id: memberId
            }
          });
          // if have some members we will redraw table using footable plugin
          if ($scope.members.length) {
            // make sure changes to scope are applied
            // and redraw footable table with current member list
            $timeout(function() {
              $('.footable').trigger('footable_redraw');
              $scope.isLoading = false;
            });
          } else {
            $scope.isLoading = false;
          }
        }).catch(function (error) {
          $scope.isLoading = false;
          $alert.error(error.error, $rootScope);
        });
      };

      /**
       * Checks if any member records are selected in the table
       * and updates $scope.hasSelected value
       */
      $scope.checkSelected = function() {
        $scope.hasSelected = !!getSelectedMembers().length;
      }

      /**
       * Toggle all selected member records of specified type
       */
      $scope.toggleAll = function() {
        // toggle checkboxes only for current page
        currentPageMembers.forEach(function(member) { member.isSelected = $scope.isAllSelected });
      }

      /**
       * Removes member from the current role
       * After removing record from the server, it removes the record from the table
       *
       * @param  {Object}  member member record
       * @return {Promise}            promise to remove member
       */
      $scope.removeMember = function(member) {
        member.isRemoving = true;
        return RoleService.unassignRole($stateParams.roleId, member.id).then(function() {
          _.remove($scope.members, { id: member.id });
          // we remove row of deleted member from footable table
          // which will also triggers footable table redraw
          // we don't worry to call it after $scope.members is updated so we don't use $timeout here
          var $footable = $('.footable');
          var ft = $footable.data('footable');
          ft.removeRow($footable.find('tr#' + member.id));
        }).catch(function(error) {
          member.isRemoving = false;
          $alert.error('Cannot remove member with id `' + member.memberId + '`. ' + error.error, $rootScope);
        });
      }

      /**
       * Remove all selected member records
       */
      $scope.removeSelected = function() {
        $alert.clear();
        $scope.isProcessing = true;

        var selectedMembers = getSelectedMembers();

        // for now we remove all members in parallel
        // it's preferable, because it's faster
        // though if there will be any issues with server overload
        // it can be rewritten so requests go one by one
        $q.all(selectedMembers.map(function(member) {
          return $scope.removeMember(member);
        })).then(function() {
          // uncheck select all checkbox as we already removed all selected items
          $scope.isAllSelected = false;
          $scope.checkSelected();
        }).catch(function(error) {
          $alert.error(error.error, $rootScope);
        }).finally(function() {
          $scope.isProcessing = false;
        });
      }

      /**
       * Uncheck all checkboxes
       */
      function uncheckAll() {
        $scope.isAllSelected = false;
        $scope.members.forEach(function(member) {
          member.isSelected = false;
        });
        $scope.checkSelected();
      }

      /**
       * Updates current page member list
       *
       * @param  {Event}  event event which contains ft property
       */
      function updateCurrentPage(event) {
        var ft = event.ft;

        // if pager plugin of footable plugin was completely initialized
        if (ft.pageInfo && ft.pageInfo.pages && ft.pageInfo.pages.length) {
          // get the list of member on the current page
          currentPageMembers = ft.pageInfo.pages[ft.pageInfo.currentPage].map(function(row) {
            return _.find($scope.members, { id: row.id });
          });
          // clear queue of currently loading user handles
          loadUser.clearQueue();
          // load user handles for members visible on the current page
          currentPageMembers.forEach(function(member) {
            loadUser(member.id);
          });
        }
      }

      angular.element(document).ready(function() {
        $('.footable').on({
          // we watch footable jquery plugin footable_page_filled event
          // to update current page member list when rows on the page are changed
          footable_page_filled: updateCurrentPage,
          // when changing sort order or page, we uncheck all checkboxes
          // to avoid having checked but invisible rows
          footable_paging: function() {
            $scope.$apply(uncheckAll);
          },
          footable_sorted: function() {
            $scope.$apply(uncheckAll);
          }
        }).footable();
      });

      // load role on init
      $scope.loadRole($stateParams.roleId);
    }
]);
