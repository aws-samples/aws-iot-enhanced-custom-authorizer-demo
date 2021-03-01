/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
    statement.Resource = "arn:aws:iot:us-east-1:0000000000:*";
    policyDocument.Statement[0] = statement;
    authResponse.policyDocuments = [policyDocument];
    authResponse.disconnectAfterInSeconds = 3600;
    authResponse.refreshAfterInSeconds = 300;

    return authResponse;
}
