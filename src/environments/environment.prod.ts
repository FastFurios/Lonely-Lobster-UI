export const environment = {
  production: true,
  API_URL: "https://lonely-lobster-ftdqhshte9abe3eq.germanywestcentral-01.azurewebsites.net/",
  version: "7.0.0",

  // msal config details
  msalConfig: {
    clientId: "7d27668f-05e5-4bbf-a904-b97b2574c813", // Azure Portal / Entra Standardverzeichnis / App Registration: Application (client) ID: it is the application id of this Angular "Lonely Lobster Frontend (DEV) 
    authority: "https://login.microsoftonline.com/49bf30a4-54b2-47ae-b9b1-ffa71ed3d475",  // Azure Portal / Entra Standardverzeichnis / App Registration: Directory (tenant) ID i.e. my tenant id
    redirectUri: 'https://lonely-lobster-ftdqhshte9abe3eq.germanywestcentral-01.azurewebsites.net' // change redirect url based on where u want to redirect after the authentication
  }
}
// https://stackoverflow.com/questions/47426721/angular-cli-change-rest-api-url-on-build