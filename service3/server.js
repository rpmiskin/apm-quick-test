


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
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3002;

const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";

// const client = new MongoClient(uri);
const client = new MongoClient(
  uri,
  {
    monitorCommands: true,
    maxPoolSize: 5,
    minPoolSize: 1
  }
);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.disable('x-powered-by');
app.use(express.json());
app.get('/movie', async (req, res) => {

  const database = client.db('sample_mflix');
  let movies = database.collection('movies');
  try {
    const moviesResult = await movies.find({$where: 'sleep(1000)|true'}).toArray();
    res.status(200).send(moviesResult);
  } catch (e) {
    res.status(500).send(e.message);
  }
})


app.get('/poolTester', async (req, res) => {
  // Attempt to max out the connection Pool with parallel queries.
  const database = client.db('sample_mflix');
  let movies = database.collection('movies');
  let allPromises = [];
  let i=0;
  while (i<20){
    allPromises.push(movies.find({$where: 'sleep(500)||true'}).toArray());
    i++;
  };
  
  await Promise.all(allPromises);

  res.status(200).send('ok');
})


app.listen(port, async () => {
  await client.connect();
  console.log(`Echo server listening at http://localhost:${port}`)
})

