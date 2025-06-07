// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version: "7.1.1",  // fix for issue #25 (wip limit optimization from start editable in Editor)
  API_URL: "http://localhost:3000/",

  // msal config details
  msalConfig: {
    clientId: "<use your own Azure IDP reference for DEV>", // Azure Portal / Entra Overview / App Registration: Application (client) ID: it is the application id of this Angular "Lonely Lobster Frontend (DEV) 
    authority: "https://login.microsoftonline.com/<use your own Azure tenant>",  // Azure Portal / Entra Overview / App Registration: Directory (tenant) ID i.e. my tenant id
    redirectUri: 'http://localhost:4200' // change redirect url based on where u want to redirect after the authentication
  }
}
