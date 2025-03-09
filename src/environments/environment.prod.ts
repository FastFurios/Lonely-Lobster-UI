export const environment = {
  production: true,
  API_URL: "https://lonely-lobster-ftdqhshte9abe3eq.germanywestcentral-01.azurewebsites.net/",
  version: "7.0.2",

  // msal config details
  msalConfig: {
    clientId: "<use your own Azure IDP reference for PROD>", // Azure Portal / Entra Standardverzeichnis / App Registration: Application (client) ID: it is the application id of this Angular "Lonely Lobster Frontend (DEV) 
    authority: "https://login.microsoftonline.com/<use your own Azure tenant>",  // Azure Portal / Entra Standardverzeichnis / App Registration: Directory (tenant) ID i.e. my tenant id
    redirectUri: 'https://lonely-lobster-ftdqhshte9abe3eq.germanywestcentral-01.azurewebsites.net' // change redirect url based on where u want to redirect after the authentication
  }
}
// https://stackoverflow.com/questions/47426721/angular-cli-change-rest-api-url-on-build