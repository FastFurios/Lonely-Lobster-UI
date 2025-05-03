// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version: "7.1.0",  // loading work order load files
  API_URL: "http://localhost:3000/",

  // msal config details
  msalConfig: {
    clientId: "7d27668f-05e5-4bbf-a904-b97b2574c813", // Azure Portal / Entra Overview / App Registration: Application (client) ID: it is the application id of this Angular "Lonely Lobster Frontend (DEV) 
    authority: "https://login.microsoftonline.com/49bf30a4-54b2-47ae-b9b1-ffa71ed3d475",  // Azure Portal / Entra Overview / App Registration: Directory (tenant) ID i.e. my tenant id
    redirectUri: 'http://localhost:4200' // change redirect url based on where u want to redirect after the authentication
  }
}
