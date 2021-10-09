


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


const express = require('express');
const request = require('request-promise-native');
const app = express();
const port = process.env.PORT || 3003;


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.disable('x-powered-by');
app.use(express.json());
app.get('/legacy', async (req, res) => {

  try {
    const response = await request('http://localhost:3001/service1');
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send(e.message);
  }
})

app.get('/delayMe', async (req, res) => {
  await sleep(500);
  try {
    const response = await axios.get('http://localhost:3000/distributed/call');
    // res.status(200).send(response.data);
  } catch (e) {
    // res.status(500).send(e.message);
  }
  await sleep(500);
  try {
    const response = await axios.get('http://localhost:3000/distributed/call');
    // res.status(200).send(response.data);
  } catch (e) {
    // res.status(500).send(e.message);
  }
  await sleep(500);
  res.status(200).send('ok');
})


app.listen(port, () => {
  console.log(`Echo server listening at http://localhost:${port}`)
})

