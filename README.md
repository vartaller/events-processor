# Events Processor

## Features

- Get the Click-Through Rate (CTR) for each campaign on a specified day
- Get daily statistics including clicks, views, and unique sessions for a given period.

## Installation and start

Events Processor requires [Node.js](https://nodejs.org/) v16+ to run.

Install the dependencies and start the app server.
```sh
cd events-processor
npm i
npm run start
```

## Usage
To make requests to the API, you can use the platform API for developers, for example [Postman](https://www.postman.com).
There is a DGTL.postman_collection.json - import it to Postman in order to get complete set of requests with all needed.

##### Get CTR

To get the Click-Through Rate (CTR) for each campaign on a specified day, use the **`GET` request** to the **endpoint: `{{url}}/rate`** with query parameter **`date`** in **`yyyy-mm-dd`** format.

##### Get Statistics

daily statistics including clicks, views, and unique sessions for a given period, use the **`GET` request** to the **endpoint: `{{url}}/statistics`** with query parameters **`startDate`** **`endDate`** in **`yyyy-mm-dd`** format.

