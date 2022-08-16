#!/usr/bin/node

import fs from 'fs'

// Read the api key from api.pem
var apiKey = fs.readFileSync('api.pem');

var pid = fs.readFileSync('pid.pem');

var number = fs.readFileSync('number');

console.log('API Key: ' + apiKey);
console.log('Project ID: ' + pid);
console.log('Number: ' + number);

import { Voice } from '@signalwire/realtime-api'

const client = new Voice.Client({
  project: pid,
  token: apiKey,
  contexts: ["SPAM"]
})

// while ture loop
while (true) {
try {
  const call = await client.dialPhone({
    from: number,  // The number you bought from SignalWire
    to: number,
    timeout: 30
  })

  console.log('SUCCESS!!! ', call.id)
} catch (e) {
  console.error(e)
}
}

