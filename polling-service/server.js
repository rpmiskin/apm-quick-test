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


const cron = require('node-cron');
const axios = require('axios');


cron.schedule('*/2 * * * * *', async () => {
  let trans, success;
  if(process.env.TRANSACTION) {
    trans = apm.startTransaction('polling service1', 'cron', {});
  }
  console.log('running a task every 5 seconds');
  try {
    const response = await axios.get('http://localhost:3000/distributed/call');
    console.log('ok')
  } catch (e) {
    console.log('not ok');
  }
  if (trans) {
    trans.end(success?'success':'failure');
  }
});