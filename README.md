# APM Quick Test

A quick test showing how Elastic APM can log information for ExpressJS apps.

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

**IMPORTANT NOTE**
With v4.1 of the `mongodb` node module the default behaviour changed
so that `monitorCommands` is false. If this is not set to true, the
the MongoClient does not fire the events that the apm instrumentation
expects.
(The apm instrumentation appears to attempt to reenable this, but this
does not appear to work.)

## Service 4

What about legacy code that uses something other than `axios`?
The Elastic APM agent instruments at the level of the Http and
Https modules so this should _just work_.

Service 4 starts a server that uses `request-promise-native` to
call the Service 2, which in turn calls Service 1. We should end
up with a trace across all three services...

To run the example, first start service 1 and 2, and then run the
following:

```
cd service4
npm start
```

And in a separate prompt

```
curl http://localhost:3003/legacy
```

When you look in the APM Dashboard there will be a transaction for
service 4, and you should see that it calls Service 2 which in turn
calls Service 1.

# Timed polling

What about code that is not a web service, but kicks of an activity
with a timer? In this scenario there is no automated transaction created
so we must use the transaction API to create one.

For this example we'll use polling-service, which uses `node-cron` to
repeatedly call Service 1.

To run the example without custom transactions do the following:

```
cd polling-service
npm i
npm start
```

This will then call service1 every 5 seconds. If you look in the APM
dashboard you'll see no transactions for `polling-service` but you
will see evidence that service1 is being regularly called.

If you exit the running instance, and instead start it as follows:

```
TRANSACTION=true npm start
```

the `polling-service` will start a new transaction each time the cron
schedule triggers, and the transaction traces across into service1
as you would expect.

The same mechanism would be needed if messages are triggered by
a message queue (e.g. Kafka, RabbitMQ etc).

# Custom Spans

The examples above show how APM instruments javascript code to start
transactions when a request is recieved, and create spans to cover outbound
http requests and database calls. What about tracking our internal code more
closely? Maybe there are functions that can be slow processing data. This
is where custom spans could be useful.

Assuming that service1 is still running you can execute a custom span example
as follows:

```
cd custom-spans
npm i
npm start
```

This is run a script where each function is annotated as a span, and it makes a couple
of calls to service1. When you view the output in the APM dashboard you can clearly see
which function is calling what, and where time is being spent. (The example includes some
delays to make this all nice and clear).

Annotating every function is unlikely to be worthwhile but, depending on your codebase, you
could imagine annotating the entry/exit of certain areas of logic.
