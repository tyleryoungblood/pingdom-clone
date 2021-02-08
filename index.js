/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http');
let url = require('url');


// The server should respont to all requests with a string
var server = http.createServer(function(req,res) {

    // Get URL and parse it 
    // (true means set parsedURL.query value to queryString module which is built into node)
    let parsedURL = url.parse(req.url,true);

    // Get path from URL
    let path = parsedURL.pathname; // the untrimmed path
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Send response
    res.end('Hello World\n');

    // Log the requested path
    console.log('Request received on path: ' + trimmedPath);
    
});

// Start the sever, and have it listen on port 3000
server.listen(3000, function(){
    console.log('The server is listening on port 3000 now.');
});