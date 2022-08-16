#!/usr/bin/node

import fs from 'fs'

// Read the api key from api.pem
var apiKey = fs.readFileSync('api.pem');

var pid = fs.readFileSync('pid.pem');

var fromnumber = fs.readFileSync('fromnumber');

var tonumber = fs.readFileSync('tonumber');

console.log('API Key: ' + apiKey);
console.log('Project ID: ' + pid);
console.log('From Number: ' + fromnumber);
console.log('To Number: ' + tonumber);

import { Voice } from '@signalwire/realtime-api'

const client = new Voice.Client({
  project: apiKey,
  token: pid,
  contexts: ["SPAM"]
})

// while ture loop
while (true) {
try {
  const call = await client.dialPhone({
    from: fromnumber,  // The number you bought from SignalWire
    to: tonumber,
    timeout: 30
  })

  console.log('SUCCESS!!! ', call.id)
} catch (e) {
  console.error(e)
}
}

