/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;


// To run this, open two terminals, one at root and type `node index.js`
// in the second terminal, type `curl localhost:3000/foo/bar`
// you should see `foo/bar` in the terminal window running node


// The server should respont to all requests with a string
const server = http.createServer(function(req,res) {

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

        // Send response
        res.end('Hello World\n');

        // Log the requested path
        console.log('Request received on path: ' + trimmedPath+ 
                    ' with this method: ' +method+ 
                    ' and with these queryString parameters: ', queryStringParsed);
        console.log('Request received with these headers', headers);
        console.log('Request was received with this payload: ', buffer);
    })

    
});

// Start the sever, and have it listen on port 3000
server.listen(3000, function(){
    console.log('The server is listening on port 3000 now.');
});