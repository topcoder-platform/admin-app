'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.GroupMembersListController', [
              '$scope', '$rootScope', 'GroupMemberService', 'IdResolverService', 'UserService', 'GroupService', '$stateParams', '$state', '$q', 'Alert', '$timeout', 'moment', '$animate',
    function ($scope, $rootScope, GroupMemberService, IdResolverService, UserService, GroupService, $stateParams, $state, $q, $alert, $timeout, moment, $animate) {

      // keep member types for easy iterating
      $scope.memberTypes = ['group', 'user'];

      // true if list is loading
      $scope.isLoading = {};
      $scope.memberTypes.forEach(function(memberType) {
        $scope.isLoading[memberType] = false;
      });

      // true if something is we are removing a bulk of entries
      $scope.processing = false;

      // list data
      $scope.memberships = {};
      $scope.memberTypes.forEach(function(memberType) {
        $scope.memberships[memberType] = [];
      });

      // current group id
      $scope.groupId = $stateParams.groupId;

      // true if any members were selected in the list
      $scope.hasSelected = false;

      // keeps
      $scope.isAllSelected = {};
      $scope.memberTypes.forEach(function(memberType) {
        $scope.isAllSelected[memberType] = false;
      });

      /* Maps user ids, present in the page, into user handles. */
      $scope.users = {};
      var loadUser = IdResolverService.getUserResolverFunction($scope.users);

      /* Maps groups ids, present in the page, into group names. */
      $scope.groups = {};
      var loadGroup = IdResolverService.getGroupResolverFunction($scope.groups);

      // all memberships to implement client side filters
      var allMemberships = {};
      $scope.memberTypes.forEach(function(memberType) {
        allMemberships[memberType] = [];
      });

      // filter criteria
      $scope.filterCriteria = {};
      $scope.memberTypes.forEach(function(memberType) {
        $scope.filterCriteria[memberType] = {
          memberId: '',
          memberName: '',
          createdBy: '',
          modifiedBy: '',
          createdAtFrom: '',
          createdAtTo: '',
          modifiedAtFrom: '',
          modifiedAtTo: ''
        };
      });

      /**
       * Return membership records which are selected in the table by checkboxes
       *
       * @return {Array} membership records
       */
      function getSelectedMemberships() {
        return $scope.memberTypes.reduce(function(selectedMemberships, memberType) {
          return selectedMemberships.concat($scope.memberships[memberType].filter(function(membership) {
            return membership.isSelected;
          }));
        }, []);
      }

      /**
       * Get list of group members for specified group
       *
       * @param  {String} groupId group id for getting members
       */
      $scope.fetch = function(groupId) {
        $alert.clear();
        $scope.memberTypes.forEach(function(memberType) {
          $scope.isLoading[memberType] = true;
        });

        GroupMemberService.fetch(groupId).then(function(data) {
          $scope.memberTypes.forEach(function(memberType) {
            $scope.memberships[memberType] = data.content.filter(function(membership) { return membership.membershipType === memberType });
            allMemberships[memberType] = _.clone($scope.memberships[memberType]);
            $scope.memberships[memberType].forEach(function(membership) {
              loadUser(membership.createdBy);
              loadUser(membership.modifiedBy);

              if (memberType === 'user') {
                // for user members load handles
                loadUser(membership.memberId);
              } else {
                // for group members load names
                loadGroup(membership.memberId);
              }
            });

            // if have some members we will init footable plugin
            if ($scope.memberships[memberType].length) {
              // make sure changes to scope are applied
              // and redraw footable table with current member list
              $timeout(function() {
                $('.footable.table-type-' + memberType).footable();
                $scope.isLoading[memberType] = false;
              });
            } else {
              $scope.isLoading[memberType] = false;
            }
          });
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
          $scope.memberTypes.forEach(function(memberType) {
            $scope.isLoading[memberType] = false;
          });
        });
      };

      /**
       * Checks if any membership records are selected in the table
       * and updates $scope.hasSelected value
       */
      $scope.checkSelected = function() {
        $scope.hasSelected = !!getSelectedMemberships().length;
      }

      /**
       * Toggle all selected membership records of specified type
       *
       * @param  {String} memberType type of membership
       */
      $scope.toggleAll = function(memberType) {
        $scope.memberships[memberType].forEach(function(membership) { membership.isSelected = $scope.isAllSelected[memberType] });
      }

      /**
       * Removes member from the current group
       * After removing record from the server, it removes the record from the table
       *
       * @param  {Object}  membership membership record
       * @return {Promise}            promise to remove member
       */
      $scope.removeMember = function(membership) {
        membership.isRemoving = true;
        return GroupMemberService.removeMember($stateParams.groupId, membership.id).then(function() {
          $scope.memberships[membership.membershipType] = $scope.memberships[membership.membershipType].filter(function(record) {
            return record.id !== membership.id;
          });
          allMemberships[membership.membershipType] = allMemberships[membership.membershipType].filter(function(record) {
            return record.id !== membership.id;
          });
        }).catch(function(error) {
          membership.isRemoving = false;
          $alert.error('Cannot remove member with id `' + membership.memberId + '`. ' + error.error, $rootScope);
        });
      }

      /**
       * Remove all selected membership records
       */
      $scope.removeSelected = function() {
        $alert.clear();
        $scope.processing = true;

        var selectedMemberships = getSelectedMemberships();

        // for now we remove all members in parallel
        // it's preferable, because it's faster
        // though if there will be any issues with server overload
        // it can be rewritten so requests go one by one
        $q.all(selectedMemberships.map(function(membership) {
          return $scope.removeMember(membership);
        })).catch(function(error) {
          $alert.error(error.error, $rootScope);
        }).finally(function() {
          $scope.processing = false;
        });
      }

      /**
       * Open datetimepicker
       *
       * @param  {Object} e          event object
       * @param  {String} inputName  name of the input
       * @param  {String} memberType member type
       */
      $scope.openCalendar = function (e, inputName, memberType) {
        if (!$scope[inputName + 'Open']) {
          $scope[inputName + 'Open'] = {};
        }

        if ($scope[inputName + 'Open'][memberType]) {
          return;
        }

        $scope[inputName + 'Open'][memberType] = true;

        if (e && e.preventDefault) {
          e.preventDefault();
        }

        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
      };

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
       * @param  {String}   memberType   type of membership we are redrawing
       * @param  {Array}    memberships  new array of memberships which has to displayed
       *
       * @return {Promise} resolved after table was completely updated
       */
      function redrawTableWithMemberships(memberType, memberships) {
        var $footable = $('.footable.table-type-' + memberType);

        // disable animations for rows, so old rows will be removed immediately
        // from the DOM tree and footable can see changes
        $footable.find('tr').each(function(index, el) {
          $animate.enabled(el, false);
        });

        // update memberships list in scope
        $scope.memberships[memberType] = memberships;

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

      // promise to get list of groups
      // this list is used to resolve groups ids by its group names
      var groupIdsByNamePromise = null;

      /**
       * Find group id by its name
       *
       * This is helper function which return value in special shape
       * along with group ids array it return label defined by 'valueType'
       *
       * This function just retrieves all the groups and after resolves names by
       * searching in group list client side.
       *
       * @param  {String} groupName group name
       * @param  {String} valueType label of the returned value
       * @return {Promise}          resolved to object {value: <array of group ids>, type: valueType}
       */
      function getGroupIdsFilteredByName(groupName, valueType) {
        if (!groupIdsByNamePromise) {
          groupIdsByNamePromise = GroupService.fetch().then(function(data) {
            return data.content;
          });
        }

        groupName = groupName.toLowerCase();

        return groupIdsByNamePromise.then(function(groups) {
          var filteredGroups = _.filter(groups, function(group) {
            return _.includes(group.name.toLowerCase(), groupName);
          });

          return {
            type: valueType,
            value: _.map(filteredGroups, 'id')
          }
        });
      }

      // object keys of which are user handles
      // and values are promises to resolve according user handles by ids
      var userIdsByHandlePromises = {};

      /**
       * Find user id by its handle
       *
       * This is helper function which return value in special shape
       * along with user ids array it return label defined by 'valueType'
       *
       * This function makes request for each user handle and saves resolved promise,
       * so second time server request is not being sent to the server for the same user handle.
       *
       * @param  {String} userHandle user handle
       * @param  {String} valueType label of the returned value
       * @return {Promise}          resolved to object {value: <array of user id>, type: valueType}
       */
      function getUserIdsFilteredByHandle(userHandle, valueType) {
        if (!userIdsByHandlePromises[userHandle]) {
          userIdsByHandlePromises[userHandle] = UserService.find({
            fields: 'id',
            filter: 'handle=*' + userHandle + '*&like=true',
            limit: 1000000 // set big limit to make sure server returns all records
          }).then(function(users) {
            return _.map(users, 'id');
          });
        }

        return userIdsByHandlePromises[userHandle].then(function(userIds) {
          return {
            type: valueType,
            value: userIds
          }
        });
      }

      /**
       * Helper function which performs all the requests to the server which are required to filter membership tables
       *
       * @param  {String} memberType         member type
       * @param  {Array}  filteredMembersips list of membership to filter
       * @return {Promise}                   resolves to filtered membership list
       */
      function filterWithRequests(memberType, filteredMembersips) {
        // list of all the server requests which we have to make to filter members
        var requests = [];

        // as on client side we don't know user handles for member, createdBy, modifiedBy users
        // and we don't group names
        // to filter by them we have to get their according user ids and group ids
        // so we create requests to the server

        if (memberType === 'group' && $scope.filterCriteria[memberType].memberName) {
          requests.push(getGroupIdsFilteredByName($scope.filterCriteria[memberType].memberName, 'memberName'));
        }

        if (memberType === 'user' && $scope.filterCriteria[memberType].memberName) {
          requests.push(getUserIdsFilteredByHandle($scope.filterCriteria[memberType].memberName, 'memberName'));
        }

        if ($scope.filterCriteria[memberType].createdBy) {
          requests.push(getUserIdsFilteredByHandle($scope.filterCriteria[memberType].createdBy, 'createdBy'));
        }

        if ($scope.filterCriteria[memberType].modifiedBy) {
          requests.push(getUserIdsFilteredByHandle($scope.filterCriteria[memberType].modifiedBy, 'modifiedBy'));
        }

        // after we get all ids from the server we can filter data client side
        return $q.all(requests).then(function(ids) {
          var idsObj = {};

          ids.forEach(function(result) {
            idsObj[result.type] = result.value;
          });

          // memberName
          if ($scope.filterCriteria[memberType].memberName) {
            if (!idsObj['memberName'].length) {
              filteredMembersips = [];
            } else {
              filteredMembersips = filteredMembersips = _.filter(filteredMembersips, function(membership) {
                return _.includes(idsObj['memberName'], membership.memberId.toString());
              });
            }
          }

          // createdBy
          if ($scope.filterCriteria[memberType].createdBy) {
            if (!idsObj['createdBy']) {
              filteredMembersips = [];
            } else {
              filteredMembersips = filteredMembersips = _.filter(filteredMembersips, function(membership) {
                return membership.createdBy && _.includes(idsObj['createdBy'], membership.createdBy.toString());
              });
            }
          }

          // modifiedBy
          if ($scope.filterCriteria[memberType].modifiedBy) {
            if (!idsObj['modifiedBy']) {
              filteredMembersips = [];
            } else {
              filteredMembersips = filteredMembersips = _.filter(filteredMembersips, function(membership) {
                return membership.modifiedBy && _.includes(idsObj['modifiedBy'], membership.modifiedBy.toString());
              });
            }
          }

          return filteredMembersips;
        });
      }

      /**
       * Returns date in EDT timezone
       * Ignores time and set it to 00:00:00.0000
       *
       * As we display dates in EDT timezone, but datepicker selects dates in a local user timezone
       * we have to treat returned date by datepicker as date in EDT
       *
       * @param  {Mixed}  date date from datepicker
       * @return {Moment}      date in EDT timezone
       */
      function getDateInEDTTimezone(date) {
        var momentDate = moment(date);
        var momentDateEDT = moment.tz([momentDate.year(), momentDate.month(), momentDate.date()], 'America/New_York');

        return momentDateEDT;
      }

      /**
       * Applies filter to the member list
       */
      $scope.applyFilter = function(memberType) {
        // wait until we filter everything not matter synchronously or making requests to server
        var filteredMembersips = _.clone(allMemberships[memberType]);

        // memberId
        if ($scope.filterCriteria[memberType].memberId) {
          filteredMembersips = _.filter(filteredMembersips, function(membership) {
            return membership.memberId.toString() === $scope.filterCriteria[memberType].memberId;
          });
        }

        // createdAtFrom
        if ($scope.filterCriteria[memberType].createdAtFrom) {
          var createdAtFrom = getDateInEDTTimezone($scope.filterCriteria[memberType].createdAtFrom);

          filteredMembersips = _.filter(filteredMembersips, function(membership) {
            return membership.createdAt && createdAtFrom.isSameOrBefore(membership.createdAt, 'day');
          });
        }

        // createdAtTo
        if ($scope.filterCriteria[memberType].createdAtTo) {
          var createdAtTo = getDateInEDTTimezone($scope.filterCriteria[memberType].createdAtTo);

          filteredMembersips = _.filter(filteredMembersips, function(membership) {
            return membership.createdAt && createdAtTo.isSameOrAfter(membership.createdAt, 'day');
          });
        }

        // modifiedAtFrom
        if ($scope.filterCriteria[memberType].modifiedAtFrom) {
          var modifiedAtFrom = getDateInEDTTimezone($scope.filterCriteria[memberType].modifiedAtFrom);

          filteredMembersips = _.filter(filteredMembersips, function(membership) {
            return membership.modifiedAt && modifiedAtFrom.isSameOrBefore(membership.modifiedAt, 'day');
          });
        }

        // modifiedAtTo
        if ($scope.filterCriteria[memberType].modifiedAtTo) {
          var modifiedAtTo = getDateInEDTTimezone($scope.filterCriteria[memberType].modifiedAtTo).add(1, 'days');

          filteredMembersips = _.filter(filteredMembersips, function(membership) {
            return membership.modifiedAt && modifiedAtTo.isSameOrAfter(membership.modifiedAt, 'day');
          });
        }

        // if we still have some membership to filter
        // and have any filter that require making requests to server
        if (filteredMembersips.length > 0 && (
            $scope.filterCriteria[memberType].memberName ||
            $scope.filterCriteria[memberType].createdBy ||
            $scope.filterCriteria[memberType].modifiedBy
          )) {

          $scope.isLoading[memberType] = true;

          return filterWithRequests(memberType, filteredMembersips).then(function(filteredMembersips) {
            // after we filtered data we redraw table
            redrawTableWithMemberships(memberType, filteredMembersips).then(function() {
              $scope.isLoading[memberType] = false;
            });
          }).catch(function(error) {
            // is any error occurs show it and leave table untouched
            $scope.isLoading[memberType] = false;
            $alert.error(error.error, $rootScope);
          });

        // if we don't filter by handle which makes server request
        // redraw table immediately
        } else {
          redrawTableWithMemberships(memberType, filteredMembersips);
        }
      }

      // load the clients on controller init
      $scope.fetch($stateParams.groupId);

      // load name of current group
      loadGroup($scope.groupId);
    }
]);
