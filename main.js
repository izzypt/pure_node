const http = require('http');
const https = require('https');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const fs = require('fs')
const crud = require('./lib/data')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')

/*************************/
/* --- SERVER LOGIC --- */
/***********************/
let unifiedServer = (req, res) => {
    //Get basic info from request
    let parsedUrl = url.parse(req.url, true)
    let path = parsedUrl.pathname
    let method = req.method.toLowerCase()
    let query = parsedUrl.query
    let headers = req.headers
    let decoder = new StringDecoder('utf-8');
    let buffer = ''
    //Data comes in chuncks by stream. Write them them to the buffer whenever data event is emitted.
    req.on('data', (data) => {
        buffer += decoder.write(data)
    })
    //When request ends, handle response accordingly.
    req.on('end', () => {
        buffer += decoder.end();
        let data = {
            'path' : path,
            'method' : method,
            'query': query,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        } 
        let chosenHandler = router.hasOwnProperty(path) ? router[path] : handlers.notFound 
        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {}

            let payloadString = JSON.stringify(payload)
            res.writeHead(statusCode);
            res.end(payloadString)

            console.log("Returned this: ", statusCode, payloadString)
        })
    })
};

/*******************/
/* --- ROUTER --- */
/*****************/
let router = {
'/sample': handlers.sample,
'/users': handlers.users,
'/tokens': handlers.tokens
}

/************************/
/* --- SERVER INIT --- */
/**********************/

/*  http server  */
const httpserver = http.createServer((req,res) => {
    unifiedServer(req, res)
 })

httpserver.listen(config.port , () => {
    console.log(`Server listening on port ${config.port} in ${config.envName} mode...`)
})

/* https server */
let httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsServerOptions, (req,res) => {
    unifiedServer(req, res)
 })

httpsServer.listen(config.httpsPort , () => {
    console.log(`Server listening on port ${config.httpsPort} in ${config.envName} mode...`)
})