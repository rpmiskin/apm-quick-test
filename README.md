# APM Quick Test

A (very) quick test showing how Elastic APM can log information for ExpressJS apps.

## Deploy Elastic APM

Follow the steps [here](https://www.elastic.co/guide/en/apm/get-started/current/quick-start-overview.html) to deploy a full Elastic stack with APM with `docker compose`.
This is **not** suitable for ops, but it is quick.

For convenience I have placed a copy of the compose file in the `apm-setup` folder.
You can simply clone the git repo, `cd` into the apm-setup folder and run `docker compose up`.

## Service1

`service1` is a simple echo server (it responds with whatever it is called with) and is configured to send data to APM. Launch it using the following:

```
cd service1
npm i
npm start
```

You can then trigger it using the following:

```
curl http://localhost:3000/and/any/path/you/want
curl -XPOST http://localhost:3000/a/posted/path
```

You should be able to view the data by going to the [APM tutorial](http://localhost:5601/app/home#/tutorial/apm) running in compose, and clicking 'Load Kibana Objects' and then 'Launch APM'.

The APM dashboard is should now be visible with some data for `service1`. Drilling into the service you should see data for both the "GET /_" and the "POST /_" endpoints.

## Service 2

The first service should be sufficient to show that the tracing is working, now we'll start a second service (`service2`) that will call `service1` this will show that distributed tracing it working.

Launch `service2` by running:

```
cd service2
npm i
npm start
```

This can be invoked by using:

```
curl http://localhost:3001/service1
```

If you go back to the APM dashboard, and look at the 'services' page you will now see both 'service1' and 'service2'. If you drill into 'Service2', go to 'Transactions', and scroll to the bottom you should see a table of 'Transactions'. Drill into the 'GET /service1', scroll to the bottom and you should see a trace sample that shows the time spent in service2 and in service1.

This additional service has a second slightly more interesting, endpoint that calls to the service twice with a couple of delays. You can invoke the this by using

```
curl http://localhost:3001/delayMe
```

You should be able to find the trace in the same way as above, but now you will see two separate calls from service2 into service1, and it should be clear that the most time is spent processing within service2. (Investigation will show two sleeps!)

## Service 3

The third service will show tracing to a MongoDB instance when accessed via the `mongodb@4` node module.

The code assumes there is MongoDB running on port 27017. If one is not already running, you can launch one in Docker by running the following command:

```
docker run -p 27017:27017 --name some-mongo -d mongo
```

The script `db_setup.js` populates a `movies` collection in a database called
`sample_mflix`. If there are any existing documents these are dropped! Run the
as follows:

```
cd service3
npm i
node db_setup.js
```

Now you can start the service by running

```
npm start
```

And invoke the endpoints by calling:

```
curl http://localhost:3002/movie
```

There is also an endpoint that deliberately overloads the configured connection pool, you can invoke this via

```
curl http://localhost:3002/poolTester
```

This demonstrates behaviour when there are more queries in queued
up than the connection pool can support. When you example the trace
the spans relating to mongodb queries are grouped in batches of
five which matches the configured poolsize.
