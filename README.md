glazier
==============
[![Build Status](https://travis-ci.org/yapplabs/glazier.png?branch=master)](https://travis-ci.org/yapplabs/glazier)

Dashboard for Github projects using Conductor.js and Oasis.js.


## Setup

### Install Dependencies

For the proxy:

[Grunt](http://gruntjs.com/)

    npm install -g grunt-cli

For the Glazier server:

[Ruby 1.9.3](http://www.ruby-lang.org/en/downloads/)

[Postgres 9.2.x](http://postgresapp.com/)

### Get the project

    git clone git://github.com/yapplabs/glazier
    cd glazier
    git submodule update --init

There are two components to set up:  the Glazier proxy and the back-end rails server (Glazier server).

Glazier server is a submodule.  The project is [here](https://github.com/yapplabs/glazier-server)

### Set up Githup API credentials

Create a Github app for your Glazier app at http://github.com/settings/applications/new

In the form enter:

    Application Name: anything you like (e.g. "glazier-dev")
    Main URL:         http://localhost:8000
    Callback URL:     http://localhost:8000/api/oauth/github/callback

When you submit the form you will get a **client id** and **client secret**. Set the following environment variables:

    GLAZIER_GITHUB_CLIENT_ID=<git client id>
    GLAZIER_GITHUB_CLIENT_SECRET=<git client secret>
    #these are needed in the windows running both the proxy and the server


### Setup the Database and start the server

    cd glazier-server
    bundle install
    rake db:create
    rake db:migrate
    bundle exec rails server -p 3040

### Install the Glazier proxy dependencies and start the proxy

    #open a separate window and navigate to the top glazier directory
    #make sure client id and client secret are set in this window
    npm install
    grunt ingest
    grunt

### Navigate to the app in your browser

    http://localhost:8000/api/

# Running specs

glazier-server uses RSpec for unit tests. To run them:

    bundle exec rake

To automatically execute specs as you update code and specs:

    bundle exec guard
