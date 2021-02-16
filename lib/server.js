/*
 * Server-related tasks
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

// Instantiate the server module object
const server = {};

// TODO - delete this
// helpers.sendTwilioSms('2087614474', 'Hello!', function(err){
//     console.log('this was the err', err);
// }); 



// To run this, open two terminals, one at root and type `node index.js`
// in the second terminal, type `curl localhost:3000/foo/bar`
// you should see `foo/bar` in the terminal window running node


// Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res) {
    server.unifiedServer(req,res);
});



// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res) {
    unifiedServer(req,res);
});



// All the server logic for both http and https requests
server.unifiedServer = function(req, res) {

    // Get URL and parse it 
    // (true means set parsedURL.query value to queryString module which is built into node)
    const parsedURL = url.parse(req.url,true);

    // Get path from URL
    const path = parsedURL.pathname; // the untrimmed path
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    const queryStringObject = parsedURL.query;

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = ''; // create a placeholder string, for the stream of data
    req.on('data', function(data) {
        buffer += decoder.write(data); // data stream may come in fragments
    });
    req.on('end',function(){ // entire data stream has been received
        buffer += decoder.end();

        // Choose the handler this request should go to
        // If one is not found, use the notFound handler
        let chosenHandler = server.router[trimmedPath] !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        }
        
        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to a string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log response
            console.log('Returning this response: ',statusCode,payloadString);
            
        });

    });
}

// Define a request router
server.router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};

// Init script
server.init = function() {
  // Start the HTTP sever
  server.httpServer.listen(config.httpPort, function(){
    console.log('The server is listening on port ' + config.httpPort);
  });
  // Start the HTTPS sever
  server.httpsServer.listen(config.httpsPort, function(){
    console.log('The server is listening on port ' + config.httpsPort);
  });
}

// Export the server module
module.exports = server;