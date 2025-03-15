export const environment = {
  production: true,
  API_URL: "https://lonely-lobster-ftdqhshte9abe3eq.germanywestcentral-01.azurewebsites.net/",
  version: "7.0.2",

  // msal config details
  msalConfig: {
    clientId: "65f67e5b-d0c0-4677-adf8-fc895254393a", // Azure Portal / Entra Overview / App Registration: Application (client) ID: it is the application id of this Angular "Lonely Lobster Frontend (DEV) 
    authority: "https://login.microsoftonline.com/49bf30a4-54b2-47ae-b9b1-ffa71ed3d475",  // Azure Portal / Entra Overview / App Registration: Directory (tenant) ID i.e. my tenant id
    redirectUri: 'https://lonely-lobster-ftdqhshte9abe3eq.germanywestcentral-01.azurewebsites.net' // change redirect url based on where u want to redirect after the authentication
  }
}
