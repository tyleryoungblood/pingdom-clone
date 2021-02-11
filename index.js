/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


// To run this, open two terminals, one at root and type `node index.js`
// in the second terminal, type `curl localhost:3000/foo/bar`
// you should see `foo/bar` in the terminal window running node


// Instantiate the HTTP server
const httpServer = http.createServer(function(req,res) {
    unifiedServer(req,res);
});

// Start the HTTP sever
httpServer.listen(config.httpPort, function(){
    console.log('The server is listening on port ' + config.httpPort);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, function(req,res) {
    unifiedServer(req,res);
});

// Start the HTTPS sever
httpsServer.listen(config.httpsPort, function(){
    console.log('The server is listening on port ' + config.httpsPort);
});

// All the server logic for both http and https requests
const unifiedServer = function(req, res) {

    // Get URL and parse it 
    // (true means set parsedURL.query value to queryString module which is built into node)
    const parsedURL = url.parse(req.url,true);

    // Get path from URL
    const path = parsedURL.pathname; // the untrimmed path
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    const queryStringObject = JSON.stringify(parsedURL.query, null, 4);
    const queryStringParsed = JSON.parse(queryStringObject);

    // Get the HTTP Method
    const method = req.method.toUpperCase();

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
        let chosenHandler = router[trimmedPath] || handlers.notFound;

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
const router = {
    'ping' : handlers.ping,
    'users' : handlers.users
};