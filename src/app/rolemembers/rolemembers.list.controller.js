'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.RoleMembersListController', [
              '$scope', '$rootScope', 'RoleService', 'IdResolverService', 'UserService', '$animate', '$stateParams', '$state', '$q', 'Alert', '$timeout',
    function ($scope, $rootScope, RoleService, IdResolverService, UserService, $animate, $stateParams, $state, $q, $alert, $timeout) {

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

      // keep list of all members for client side filtering
      var allMembers = [];

      // criteria to filter members
      $scope.filterCriteria = {
        userId: '',
        userHandle: ''
      };

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
          // save all members list for filtering
          allMembers = _.clone($scope.members);
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
          _.remove(allMembers, { id: member.id });
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
       * Helper function which redraws table with new member list
       * and properly takes care about updating footable plugin
       *
       * The essential problem this function is solving is that after we
       * update $scope.members, rows from the table are not being deleted immediately
       * because we are using animations for rows.
       * That's why if we try to force update footable plugin it still find old rows which are in
       * process of animation and still in DOM tree.
       * As a workaround in this function we disable animations for rows before updating them,
       * thus footable plugin can see changes immediately after scope is updated.
       *
       * @param  {Array}    members  new array of members which has to displayed
       * @param  {Function} callback optional callback after table is fully redrawn
       *
       * @return {Promise} resolved after table was completely updated
       */
      function redrawTableWithMembers(members) {
        var $footable = $('.footable');

        // disable animations for rows, so old rows will be removed immediately
        // from the DOM tree and footable can see changes
        $footable.find('tr').each(function(index, el) {
          $animate.enabled(el, false);
        });

        // update members list in scope
        $scope.members = members;

        // make sure that changes are applied to the scope
        return $timeout(function() {
          // force footable plugin to redraw
          $footable.trigger('footable_redraw');
          // enable animation for table rows again
          $footable.find('tr').each(function(index, el) {
            $animate.enabled(el, true);
          });
        });
      }

      /**
       * Applies filter to the member list
       */
      $scope.applyFilter = function() {
        var filteredMembers = _.clone(allMembers);

        // filter by ids first, it works immediately as we know all the data
        // so we don't need to show loader for this
        if ($scope.filterCriteria.userId) {
          filteredMembers = _.filter(filteredMembers, { id: $scope.filterCriteria.userId });
        }

        // if handle filter is defined and we still have some rows to filter
        if ($scope.filterCriteria.userHandle && filteredMembers.length > 0) {
          // we show loader as we need to make request to the server
          $scope.isLoading = true;

          // As there is no server API to filter role members and we don't have
          // user handles to filter, we first have to find user ids by it's handle
          // and after we can filter users by id
          UserService.find({
            fields: 'id',
            filter: 'handle=*' + $scope.filterCriteria.userHandle + '*&like=true',
            limit: 1000000 // set big limit to make sure server returns all records
          }).then(function(users) {
            var foundIds = _.map(users, 'id');

            filteredMembers = _.filter(filteredMembers, function(member) {
              return _.includes(foundIds, member.id);
            });

            redrawTableWithMembers(filteredMembers).then(function() {
              $scope.isLoading = false;
            });
          }).catch(function(error) {
            // is any error occurs show it and leave table untouched
            $scope.isLoading = false;
            $alert.error(error.error, $rootScope);
          });

        // if we don't filter by handle which makes server request
        // redraw table immediately
        } else {
          redrawTableWithMembers(filteredMembers);
        }
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

      // init footable plugin
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
