[![CircleCI](https://circleci.com/gh/topcoder-platform/admin-app.svg?style=svg)](https://circleci.com/gh/topcoder-platform/admin-app)
# support-admin-app
Support application

Internal application used to administer specific support tasks related to the Topcoder platform.

## Software Requirements

- node.js v6+
- npm v3+
- Google Chrome browser version >= 55.0.2883.0

## Installation

To install npm and bower dependencies run:

> npm install

Bower is set to run as a npm postinstall script.

## Configuration

The configuration is provided in `config.json` in the base directory.
It contains four environments (`local`, `dev`, `qa`, `prod`) which are controlled by the BUILD_ENV environment variable,
it defaults to the `dev` environment if BUILD_ENV is empty.

The following configuration parameters are available:

| Name                     | Description                     |
|--------------------------|---------------------------------|
| ES_PROJECT_API_URL       | URL of the ES project API       |
| API_URL                  | URL of the topcoder API         |
| WORK_API_URL             | URL of the topcoder work API    |
| ADMIN_TOOL_URL           | URL of the admin tool API       |
| API_VERSION_PATH         | Version of the API              |
| AUTH0_CLIENT_ID          | Client ID for Auth0             |
| AUTH0_DOMAIN             | Domain for Auth0 authentication |
| AUTH0_TOKEN_NAME         | Auth0 token name                |
| AUTH0_REFRESH_TOKEN_NAME | Auth0 refresh token name        |

## Start the Application

Simply execute the following command to start the app in development mode (with browsersync)
```
npm install
npm start
```
Application will be hosted and running at http://locahost:3000

To build the application to be hosted on a real webserver run:
```
npm run build
```

## Execute E2E Tests

Before executing the end-to-end (e2e) protractor tests, these environment variables should be set:

| Name | Description | Default Value |
| --- | --- | --- |
| BUILD_ENV | Deployment configuration to be tested by e2e tests. | See [Configuration](#configuration) for possible values. Defaults to `dev`. |
| TEST_USER | Account username to use for e2e tests. | No default. Must be set. |
| TEST_PASSWORD | Account password to use for e2e tests. | No default. Must be set. |
| TEST_PORT | Port from which to serve the app for e2e tests. | Defaults to `3000`. |

```npm test```

## Fallback instruction in case the npm scripts fail

### Install global dependencies

```npm install -g gulp@3.8.10 bower```

### Install project dependencies

```
npm install
bower install
```

### Start the Application

```gulp serve```

### Build the Application

```gulp build```

### Execute E2E Tests

```gulp protractor```
