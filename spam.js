#!/usr/bin/node

const fs = require('fs');

// Read the api key from api.pem
var apiKey = fs.readFileSync('api.pem');

console.log('apiKey: ' + apiKey);