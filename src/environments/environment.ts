// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: "http://localhost:3000/",

  // msal config details
  msalConfig: {
    clientId: "7d27668f-05e5-4bbf-a904-b97b2574c813", // Azure Portal / Entra Standardverzeichnis / App Registration: Application (client) ID: it is the application id of this Angular "Lonely Lobster Frontend (DEV) 
    authority: "https://login.microsoftonline.com/49bf30a4-54b2-47ae-b9b1-ffa71ed3d475",  // Azure Portal / Entra Standardverzeichnis / App Registration: Directory (tenant) ID i.e. my tenant id
    redirectUri: 'http://localhost:4200' // change redirect url based on where u want to redirect after the authentication
  }
}



// https://stackoverflow.com/questions/47426721/angular-cli-change-rest-api-url-on-build


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
