# Pure Node
Developing node application without framework or libraries.

Built-in node modules:

  ## http
    CreateServer() and listen() on a specific port
    DOcs : https://nodejs.org/api/http.html#http
  ## https
    https server with createServer() and listen() from https module. 
    Local certificate and key emmited with OPENSSL.
    Docs : https://nodejs.org/api/https.html#https
   ```openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem cert.pem```
     
  ## url
    To parse url's comiing from client requests, creating an object to acess multiple properties(path, query, etc...)
    Docs : https://nodejs.org/api/url.html#url
  ## fs
    Node filesystem module to write/read/update/delete.
    DOcs : https://www.w3schools.com/nodejs/nodejs_filesystem.asp
  ## crypto
    Node comes with built-in crypto which allow us to hash the passwords.
    Docs: https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/
