const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {monitorCommands:true});

async function run() {
  try {
    await client.connect();

    const database = client.db('sample_mflix');
    let movies = database.collection('movies');
    const count = await movies.find({}).count();
    if (count != 0){
        console.log(`dropping as ${count} documents`)
        movies.drop()
        database.collection('movies');
    }
    await movies.insertMany([
        {title: 'Back to the Future'},
        {title: 'Back to the Future II'},
        {title: 'Back to the Future III'},
        {title: 'Jaws'}
    ])

    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);

    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);