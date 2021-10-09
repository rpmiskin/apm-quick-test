// Add this to the VERY top of the first file loaded in your app
var apm = require('elastic-apm-node').start({
    // Override the service name from package.json
    // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    serviceName: '',
    // Use if APM Server requires a secret token
    secretToken: '',
    // Set the custom APM Server URL (default: http://localhost:8200)
    serverUrl: 'http://localhost:8200',
    // Set the service environment
    environment: 'production',
    logLevel: 'debug'
})

const axios = require('axios');


function sleep(ms=250) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function a() {
  const span = apm.startSpan('a');
  await axios.get('http://localhost:3000/custom/span');
  await sleep();
  await b();
  span.end();
}

async function b() {
  const span = apm.startSpan('b');
  await sleep();
  await c();
  await axios.get('http://localhost:3000/custom/span');
  await c();
  if (span) span.end();
}
async function c() {
  const span3 = apm.startSpan('c');
  await sleep();
  if (span3)span3.end();
}

async function run() {
  trans = apm.startTransaction('custom');
  await sleep();
  await a();
  await axios.get('http://localhost:3000/custom/span');
  trans.end()
}

run();