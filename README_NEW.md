- Step to deploy the application remain same as one explained in README.md for base code

- Plese edit backend REST API services URL in config.json if required (I have modified for dev
  profile to one provided in challenge forum)
  
- When we run the application on localhost from browser accessing to another domain is not allowed by browser
  due to same origin policy. Please install CORS plugin in the browser
  You can install CORS plugin from 
  Chrome : https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en
  FireFox : https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/?src=search
  or any other CORS plugin
  Same issue exist in base code so no changes were made to backend server and same has been confirmed
  in the forum.Alternatierly we could add CORS headers in our response to enable the same
  
- As confirmed in the forum UI look and feel is made to match more closely with existing members page
  rather than UI mockup provided
  
- Filter by challenge phase is not implemeted due to issues with backend API. confirmed in the forum

- Submissions are only added files are not uploaded to S3 as confirmed in the forum

- Phase ID field is temporarily added to take integer value as phase ID. It will be eventually removed
 and list of valid challenge phases along with id would be returned by API. Code for same has been commented
 for future use.
 
 - Currently fonts are made mandatory and stock art is optional.. Depending on business logic I can change 
  that later.