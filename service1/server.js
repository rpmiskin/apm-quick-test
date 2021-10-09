


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
const app = express();
const port = process.env.PORT || 3000;
app.disable('x-powered-by');
app.use(express.json());
app.all('*', (req, res) => {
    const {method, url, headers, query, body} = req;
    res.status(query.fail || 200).set('x-echo', 'true').send({method, url, headers, query, body})
})

app.listen(port, () => {
  console.log(`Echo server listening at http://localhost:${port}`)
})

