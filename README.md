## Topcoder Support Admin Application Local Deployment

*About: Internal application used to administer specific support tasks related to the Topcoder platform.*

### Pre-requisites

Ensure that following tools are present in your development environment

1. node.js v6+
2. npm v3+
3. Google Chrome browser version >= 55.0.2883.0

If node.js and npm is already installed in your development environment, following commands should return the appropriate version number.

1. `node --version`
2. `npm --version`

Navigate to the project directory let say **$PROJECT_HOME/admin-app** which is either cloned from github or unzipped source code directory of admin-app.

### Steps for Installation

*Assumption: Your current directory is $PROJECT_HOME/admin-app*

**Step 1:**
Execute the command `npm install` to install the necessary dependencies

Note: This would install npm dependencies as well as bower dependencies. There would be few deprecated warnings during installation which could be ignored since it doesn't impact the functioning of application as of now.

**Step 2:**
Execute the command `npm run build` to build the application

**Step 3:**
Execute the command `npm start` to run the application

**Application will be hosted and running at http://locahost:3000**

### Steps for running End to End tests<h4>

**Pre-requisites:**

Step 1 and 2 of Installation should have been completed.

1. Execute the command `npm run test` to run the automated end to end tests.

2. Results of the tests would be displayed in the terminal.

