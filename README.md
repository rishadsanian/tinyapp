
<br>

![TinyApp](https://github.com/rishadsanian/tinyapp/assets/77033627/f326b8b0-6657-46bd-9d85-dc1b25469624)


# 
<br>

## Overview

TinyApp, built with Node and Express, is a full stack, multi-page, server-side rendering web application that enables users to shorten long URLs, similar to services like TinyURL.com and bit.ly. 

This project has been completed by [Rishad Alam](https://github.com/rishadsanian) for the [Lighthouse Labs](https://www.lighthouselabs.ca/) Web Development Bootcamp.
<br>
<br>

## Table of Contents


- [Features](#features)
- [Images](#images)
- [Setup](#setup)
  - [Node](#node)
  - [Express Server](#express-server)
  - [Middleware](#middleware)
  - [Security and Authentication](#security-and-authentication)
  - [Helper Functions](#helper-functions)
  - [Functions Testing](#functions-testing)
  - [Styling](#styling)
- [Future Features](#future-features)
<br>
<br>

## Features
- Permits the user to create, read, update, and delete short-URLs and their corresponding long-URLs
- HTTP Server that handles requests from the browser (client)
- Authentication protection
- Reacts appropriately to the user's logged-in state
- Error handling features
<br>
<br>

## Images
<br>
<br>

!["Screenshot of Login page](https://github.com/rishadsanian/tinyapp/blob/master/docs/image-login.png?raw=true)
<br>

!["Screenshot of URLs page](https://github.com/rishadsanian/tinyapp/blob/master/docs/image-urls.png?raw=true)
<br>

!["Screenshot of Edit page"](https://github.com/rishadsanian/tinyapp/assets/77033627/b2bcdafa-9004-4a3b-b510-7048549afcde)

<br>

!["Screenshot of New page"](https://github.com/rishadsanian/tinyapp/assets/77033627/8450a3ea-8bf0-43c2-b1d0-34d54257114c)

<br>

!["Screenshot of Register page"](https://github.com/rishadsanian/tinyapp/blob/master/docs/image-register.png?raw=true)

<br>
<br>

## Setup

<br>

### Node 
- To get started install all dependencies and start the server
```console
 npm install
 ```
```console
 npm start
 ```
 <br>
 
### Express Server
 
   - Basic Server Setup
   - Handle Endpoints, Routing, GETS, POSTS
   - Built-in encoder for parsing
<br>
<br>

### Middleware
  - Nodemon - Auto server restart for code changes and viewing console.logs
  - Morgan - For live monitoring of event status
  - EJS  - Viewengine used to generate dynamic views with the capacity to manipulate data within HTML code
<br>
<br>

### Security and Authentication
- Bcrypt 
  -Used for generating salt used in hashing and in keys for cookie sessions
  -Used for hashing and validating passwords

- Cookie-session - Used to encrypt cookies
<br>
<br> 

### Helper Functions
  - ``` findUserByEmail ```: Checks if an email exists in the user database and returns the user id or null
  - ``` urlsForUser```: Returns the URLs for the specific logged-in user
  - ```addHttpToURL```: Adds http:// to submitted links only if http:// or https:// is missing
  - ```generateRandomString```: Generates a random string that is 6 characters in length used for short URLs and user ids

  - ```handleUnauthenticatedUser```,
  ```handleUnauthorizedAccess```,
  ```handleInvalidUrl```,
  ```handleInvalidCredentials```: Error code handler functions to handle various status codes
<br>
<br>

### Functions Testing
- Mocha and Chai  - ```assert.deepStrictEqual``` is used to compare functions that return objects
<br>
<br>

### Styling 
EJS | HTML | CSS
- Views and partials made with ejs files
-  Basic CSS styling provided using Bootstrap 
- Created buttons, forms and additional elements with custom CSS styling to keep them consistent with existing style attributes
<br>
<br>

## Future Features
- Analytics on the number of visits and unique visits on short URL
- Date of short URL creation
- Database integration
- Error view page with dynamic messaging based on error code/handler
- Copy short URL button from urlshow/urls index page
