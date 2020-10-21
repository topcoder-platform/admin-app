[![CircleCI](https://circleci.com/gh/topcoder-platform/admin-app.svg?style=svg)](https://circleci.com/gh/topcoder-platform/admin-app)
# support-admin-app
Support application

Internal application used to administer specific support tasks related to the Topcoder platform.

## Software Requirements

- node.js v6+
- npm v3+
- Google Chrome browser version >= 55.0.2883.0

## Installation

To install npm  dependencies run:

> npm install

## Configuration

The configuration is provided in `config.json` in the base directory.
It contains four environments (`local`, `dev`, `qa`, `prod`) which are controlled by the BUILD_ENV environment variable,
it defaults to the `dev` environment if BUILD_ENV is empty.

The following configuration parameters are available:

| Name                     | Description                     |
|--------------------------|---------------------------------|
| API_URL                  | URL of the topcoder API         |
| ADMIN_TOOL_URL           | URL of the admin tool API       |
| API_VERSION_PATH         | Version of the API              |
| COOKIES_SECURE           | If true the cookies set by this App will only be transmitted over secure  protocols like https. |
| AUTH_URL                 | Url of Topcoder auth form       |
| ACCOUNTS_CONNECTOR_URL   | Url to TC account connector     |
| JWT_V3_NAME              | jwt V3 cookie name              |
| JWT_V2_NAME              | jwt V2 cookie name              |
| OAUTH2_TOKEN_NAME              | OAuth2 token name              |
| OAUTH2_TOKEN_EXPIRETIME_TAGNAME           | OAuth2 token expire time tag name           |
| SPIGIT_API_URL             | SPIGIT api base url       |
| SPIGIT_API_VERSION_PATH            | SPIGIT api version path     |
| GROUP_V5_API_URL            | URL of the v5 Groups API      |
| LOOKUP_V5_API_URL            | URL of the v5 Devices API      |
| TERMS_V5_API_URL            | URL of the v5 Terms API      |
| AGREEABILITY_TYPES            | List of Agreeable types and its UUID from Database     |
| AGREE_FOR_DOCUSIGN_TEMPLATE            | UUID from Database of the `"DocuSign Template"` Agreeable type      |
| AGREE_ELECTRONICALLY | UUID from Database of the `Electronically` Agreeable Type  |


## Start the Application

As application uses Topcoder authorization we have to run it on the one of allowed domains. For development purposes we can use `local.topcoder-dev.com:3000`. So before run we have to add into `hosts` file the line `127.0.0.1 local.topcoder-dev.com`. Be aware, that we also have to run on the port `3000` to be able to authorize when run locally.

Simply execute the following command to start the app in development mode (with browsersync)
```
npm install
npm run build
npm run dev
```
Application will be hosted and running at http://local.topcoder-dev.com:3000.

## Execute E2E Tests

Before executing the end-to-end (e2e) protractor tests, these environment variables should be set:

| Name | Description | Default Value |
| --- | --- | --- |
| BUILD_ENV | Deployment configuration to be tested by e2e tests. | See [Configuration](#configuration) for possible values. Defaults to `dev`. |
| TEST_PORT | Port from which to serve the app for e2e tests. | Defaults to `3000`. |

```npm test```

## Fallback instruction in case the npm scripts fail

### Install global dependencies

```npm install -g gulp@3.8.10```

### Install project dependencies

```
npm install
```

### Start the Application

```gulp serve```

### Build the Application

```gulp build```

### Execute E2E Tests

```gulp protractor```


Update to Push CI
