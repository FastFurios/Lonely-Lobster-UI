export const environment = {
  production: true,
  API_URL: "https://lonely-lobster.azurewebsites.net/",
  version: "7.1.1",  // fix for issue #25 (wip limit optimization from start editable in Editor)

  // msal config details
  msalConfig: {
    clientId: "200c978a-9108-4e74-ae41-501e2d5a5ea1", // Azure Portal / Entra Overview / App Registration: Application (client) ID: it is the application id of this Angular "Lonely Lobster Frontend (DEV) 
    authority: "https://login.microsoftonline.com/49bf30a4-54b2-47ae-b9b1-ffa71ed3d475",  // Azure Portal / Entra Overview / App Registration: Directory (tenant) ID i.e. my tenant id
    redirectUri: 'https://lonely-lobster.azurewebsites.net' // change redirect url based on where u want to redirect after the authentication
  }
}
