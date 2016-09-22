/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// First add the obligatory web framework
var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));

// Util is handy to have around, so thats why that's here.
// and so is assert
const util = require('util')
const assert = require('assert');

// We want to extract the port to publish our app on
var port = process.env.VCAP_APP_PORT || 8080;

// Then we'll pull in the database client library
// Rabbitmq uses AMQP as a protocol, so this is a generic library for the protocol
var amqp = require("amqplib/callback_api");

// Now lets get cfenv and ask it to parse the environment variable
var cfenv = require('cfenv');
var appenv = cfenv.getAppEnv();

// Within the application environment (appenv) there's a services object
var services = appenv.services;
// The services object is a map named by service so we extract the one for rabbitmq
var rabbitmq_services = services["compose-for-rabbitmq"];

// This check ensures there is a services for RabbitMQ databases
assert(!util.isUndefined(rabbitmq_services), "Must be bound to compose-for-rabbitmq services");

// We now take the first bound RabbitMQ service and extract its credentials object
var credentials = rabbitmq_services[0].credentials;

// Within the credentials, an entry ca_certificate_base64 contains the SSL pinning key
// We convert that from a string into a Buffer entry in an array which we use when
// connecting.
var caCert = new Buffer(credentials.ca_certificate_base64, 'base64');

/// This is the ampqnode connection. From the application environment, we got the
// credentials and the credentials contain a URI for the database. Here, we
// connect to that URI

var opts = {
    ca: [caCert] // Trusted certificates
};

// We now name a queue, "hello" - we'll use this queue for communications
var q = 'hello';

// With the database going to be open as some point in the future, we can
// now set up our web server. First up we set it to server static pages
app.use(express.static(__dirname + '/public'));

// Then we create a route to handle our example database call
app.put("/message", function(request, response) {
    // To send a message, we first open a connection
    amqp.connect(credentials.uri, opts, function(err, conn) {
        // With the connection open, we then create a channel
        conn.createChannel(function(err, ch) {
            // next we make sure our queue exists
            ch.assertQueue(q, {
                durable: false
            });
            // We can now send a Buffer as a payload to the queue.
            ch.sendToQueue(q, new Buffer(request.body.message + ' : Message sent at ' + new Date()));
            // Here we write our response as plain text confirming that we sent something
            response.writeHead(200, {
                "Content-Type": "text/plain"
            });
            response.write("Sent 'Hello World!' message");
            response.end();
            // Now close the created Channel
            ch.close();
            // and set a timer to close the connection so that anything
            // in transit can clear
            setTimeout(function() { conn.close(); }, 500);
        });
    });
});

app.get("/message", function(request, response) {
    // To receive a message, we first open a connection
    amqp.connect(credentials.uri, opts, function(err, conn) {
        // With the connection open, we then crea te a channel
        conn.createChannel(function(err, ch) {
            // next we make sure our queue exists
            ch.assertQueue(q, {
                durable: false
            });
            // Now we attempt to get a message from our queue
            ch.get(q, {}, function(err, msgOrFalse) {
                
                // If the get() call got a message, write the message to
                // the response and then acknowledge the message so it is
                // removed from the queue
                if (msgOrFalse != false) {
                    response.write(util.inspect(msgOrFalse.content.toString(), false, null));
                    ch.ack(msgOrFalse);
                } else {
                    // There's nothing, write a message saying that
                    response.write("Nothing in queue")
                }
                // Wrap up the response and close the channel
                response.end();
                ch.close();
                // and set a timer to close the connection (there's an ack in transit)
                setTimeout(function() { conn.close(); }, 500);
            });
        });
    });
});


// Now we go and listen for a connection.
app.listen(port);

//require("cf-deployment-tracker-client").track();
