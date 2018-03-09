# compose-rabbitmq-helloworld-nodejs overview

compose-rabbitmq-helloworld-nodejs is a sample Bluemix application that shows you how to connect to an IBM Compose for RabbitMQ for Bluemix service using Node.js.

## Running the app on Bluemix

1. If you do not already have a Bluemix account, [sign up here][bluemix_signup_url]

2. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

3. Connect to Bluemix in the command line tool and follow the prompts to log in.

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

4. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/compose-rabbitmq-helloworld-nodejs.git
  ```

5. `cd` into this newly created directory

6. Open the `manifest.yml` file.

  - Change the `host` value to something unique. The host you choose will determinate the subdomain of your application's URL:  `<host>.mybluemix.net`.
  - Change the `name` value. The value you choose will be the name of the app as it appears in your Bluemix dashboard.

7. If you have already created a Compose for RabbitMQ service in Bluemix, update the `service` value in `manifest.yml` to match the name of your service. If you don't already have a Compose for RabbitMQ service in Bluemix, you can create one now using the `create-service` command.

  - **Note :** The Compose for RabbitMQ service does not offer a free plan. For details of pricing, see the _Pricing Plans_ section of the [Compose for RabbitMQ service][compose_for_rabbitmq_url] in Bluemix.

  - You will need to specify the service plan that your service will use, which can be _Standard_ or _Enterprise_. This readme file assumes that you will use the _Standard_ plan. To use the _Enterprise_ plan you will need to create an instance of the Compose Enterprise service first. Compose Enterprise is a service which provides a private isolated cluster for your Compose databases. For information on Compose Enterprise and how to provision your app into a Compose Enterprise cluster, see the [Compose Enterprise for Bluemix help](https://console.ng.bluemix.net/docs/services/ComposeEnterprise/index.html).

  Create your service:

  ```
  $ cf create-service compose-for-rabbitmq Standard my-compose-for-rabbitmq-service
  ```

8. Push the app to Bluemix. When you push the app it will automatically be bound to the service.

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

