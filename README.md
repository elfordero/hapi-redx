# hapi-redx

##### Red X test, hapi edition

---
## Table of contents
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Configuration](#configuration)


## Getting Started

1. `npm install` to verify all dependencies are properly installed.
2. `npm run start` to start.

---

## Running the Project

1. Open a browser and access `localhost:1338`

## Project Structure

#### Request Flow
An incoming request follows the order :

1. Request - Received from the browser.
1. Routes - Determines which handler to use.
1. Handler - Calls specific services to retrieve data.
1. Services - Retrieves the data.
1. Handler - Returns the data or calls a transform to manipulate it.
1. Transform **(optional)** - Manipulate the data.
1. Handler **(optional)** - Returns the data.
1. Response - Send the data back to the browser.

Below are the different parts of the flow described with what they do.

#### Routes
- Parse the request from the browser and determine which handler(s) to call.
- Are separated by HTTP `method`s, `path` urls, and `config` handler values/functions.
- Are all maintained within a single file `routes.js`.
- Additional information on Hapi routes can be found [here.](https://hapijs.com/tutorials/routing)

#### Handlers
- Handle the requests from the user.
- Orchestrate most of the business logic on the data.
- Use [`Joi`](https://www.npmjs.com/package/joi) for validation.
- Calls services to retrieve data.
- Calls transforms to manipulate data.
- Can be accessed through the [Swagger](http://swagger.io/specification/) browser tool.

This framework encourages good documentation within the code by including the following in the export statement:
- handler
- description
- notes
- tags
- validate

This information will be used in the Swagger browser tool to help with the development/debugging process. This tool is located at `localhost:1338`


#### Services
- Retrieve data to send back to the Handler.
- Interact directly with the database(s).
- May not be native to the project.
- Do little business logic if at all.


#### Transforms
- Manipulate the data before sending it back to the user.
- Are not required for every Handler.
- Can be selective of return data with **`Destructuring`**.

> **`Destructuring`** is an es6 implementation that helps build new structures from previous structure's data.
A tutorial on destructuring can be found [here.](https://www.eventbrite.com/engineering/learning-es6-destructuring/)

#### Helpers
- Provide little bits of often repeated code. e.g. verifying database connections.
- Are often called by services and some handlers.


----------
