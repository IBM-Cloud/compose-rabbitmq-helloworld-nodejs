# compose-rabbitmq-helloworld-nodejs overview

compose-rabbitmq-helloworld-nodejs is a sample Bluemix application that shows you how to connect to an IBM Compose for RabbitMQ for Bluemix service using Node.js.

## Running the app on Bluemix

1. If you do not already have a Bluemix account, [sign up here][bluemix_signup_url]

2. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/compose-rabbitmq-helloworld-nodejs.git
  ```

4. `cd` into this newly created directory

5. Open the `manifest.yml` file and change the `host` value to something unique.

  The host you choose will determinate the subdomain of your application's URL:  `<host>.mybluemix.net`

6. Connect to Bluemix in the command line tool and follow the prompts to log in.

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

7. Create the Compose for RabbitMQ service in Bluemix.

  **Note :** The Compose for RabbitMQ service does not offer a free plan. For details of pricing, see the _Pricing Plans_ section of the [Compose for RabbitMQ service][compose_for_rabbitmq_url] in Bluemix.

  ```
  $ cf create-service compose-for-rabbitmq Standard my-compose-for-rabbitmq-service
  ```

8. Bind the service to the application.

  ```
  $ cf bind-service compose-rabbitmq-helloworld-nodejs my-compose-for-rabbitmq-service
  ```

9. Push the app to Bluemix.

  ```
  $ cf push
  ```

Your application is now running at `<host>.mybluemix.net`. When you visit `<host>.mybluemix.net/` you will be able to view the contents of your database.

## Code Structure

| File | Description |
| ---- | ----------- |
|[**server.js**](server.js)|Establishes a connection to the RabbitMQ queue using credentials from VCAP_ENV, sends message to the queue, and receives message from the queue. |
|[**main.js**](public/javascripts/main.js)|Handles user input to put a message to the queue and outputs received messages.|

The app uses a PUT and a GET operation:

- PUT
  - takes user input from [main.js](public/javascript/main.js)
  - uses the `sendToQueue` method to add the user input as a message to the _words_ queue.

- GET
  - uses `assertQueue` method to retrieve the message from the _words_ queue
  - returns the response from the queue to [main.js](public/javascript/main.js)


## Privacy Notice
The sample web application includes code to track deployments to Bluemix and other Cloud Foundry platforms. The following information is sent to a [Deployment Tracker](https://github.com/cloudant-labs/deployment-tracker) service on each deployment:

* Application Name (application_name)
* Space ID (space_id)
* Application Version (application_version)
* Application URIs (application_uris)

This data is collected from the VCAP_APPLICATION environment variable in IBM Bluemix and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Bluemix. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

### Disabling Deployment Tracking

Deployment tracking can be disabled by removing `require("cf-deployment-tracker-client").track();` from the beginning of the `server.js` file.

[compose_for_rabbitmq_url]: https://console.ng.bluemix.net/catalog/services/compose-for-rabbitmq/
[bluemix_signup_url]: https://ibm.biz/compose-for-rabbitmq-signup
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
