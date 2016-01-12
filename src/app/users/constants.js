'use strict';

var module = angular.module('supportAdminApp');

module.constant('users.Constants', {
    
	MSG_CLIPBORD_TOOLTIP: "Copy to clipboard",
	
	MSG_CLIPBOARD_COPIED: "Copied",
	
	DICT_USER_STATUS: {
      'A': 'Active',
      'U': 'Unverified',
      '4': 'Deactivated(User request)',
      '5': 'Deactivated(Duplicate account)',
      '6': 'Deactivated(Cheating account)'
    }
});
