# admin-app
Administrative application

## Docs
 
## Development
Set JWT token for local development on the environemnt variable "DEV_JWT".
```
export DEV_JWT="......."

example : 
SET DEV_JWT=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJhZG1pbmlzdHJhdG9yIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOm51bGwsImV4cCI6MTc2NjI4OTI0NiwidXNlcklkIjoiMjI4Mzg5NjUiLCJpYXQiOjE0NTA5MjkyNDYsImVtYWlsIjpudWxsLCJqdGkiOiIxMzY5YzYwMC1lMGExLTQ1MjUtYTdjNy01NmJlN2Q4MTNmNTEifQ.gDkNcZBt6iQmlhVDYunYLySpBIQ9rrJ1AXKHpRxSXxg
```
Build and run the application.
```
npm install
./node_modules/bower/bin/bower install
gulp build serve
```
