// A simple authorizer Lambda function demonstrating
// how to parse auth token and generate response

exports.handler =  async (event, context, callback) => {
    console.log(`event: ${JSON.stringify(event)}\n`)


    const queryString = event.protocolData.http.queryString
    console.log(`queryString ${JSON.stringify(queryString)}\n`)

    const params = new URLSearchParams(queryString);

    // Log the values
    params.forEach((value, key) => {
      console.log(`${key} = ${value}\n`);
    });

    let token = params.get("token")

    if(!token){
        console.log('token not found in query string; attempting to use token in event payload')
        token = event.token
    }

    console.log(`token: ${token}\n`)

    switch (token.toLowerCase()) {
        case 'allow':
            callback(null, generateAuthResponse(token, 'Allow'));
        case 'deny':
            callback(null, generateAuthResponse(token, 'Deny'));
        default:
            callback("Error: Invalid token");
    }
};

// Helper function to generate authorization response
var generateAuthResponse = function(token, effect) {
    // Invoke your preferred identity provider
    // to get the authN and authZ response.
    // Following is just for simplicity sake

    var authResponse = {};
    authResponse.isAuthenticated = true;
    authResponse.principalId = 'principalId';

    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    var statement = {};
    statement.Action = 'iot:*';
    statement.Effect = effect;
    statement.Resource = "arn:aws:iot:us-east-1:068311527115:*";
    policyDocument.Statement[0] = statement;
    authResponse.policyDocuments = [policyDocument];
    authResponse.disconnectAfterInSeconds = 3600;
    authResponse.refreshAfterInSeconds = 600;

    return authResponse;
}
