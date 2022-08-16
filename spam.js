#!/usr/bin/node

import fs from 'fs'

// Read the api key from api.pem
const api = fs.readFileSync('api.pem', { encoding: 'utf8' });

const pid = fs.readFileSync('pid.pem', { encoding: 'utf8' });

const fromnumber = fs.readFileSync('fromnumber', { encoding: 'utf8' });

const tonumber = fs.readFileSync('tonumber', { encoding: 'utf8' });


console.log('API Key: ' + api);
console.log('Project ID: ' + pid);
console.log('From Number: ' + fromnumber);
console.log('To Number: ' + tonumber);



import { Voice } from '@signalwire/realtime-api'

const client = new Voice.Client({
  project: pid,
  token: api,
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
