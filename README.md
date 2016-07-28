# kafka-topics-ui

[![release](http://github-release-version.herokuapp.com/github/landoop/kafka-topics-ui/release.svg?style=flat)](https://github.com/landoop/kafka-topics-ui/releases/latest)

UI for viewing **Kafka topics** using the Kafka Rest Proxy built in angular - https://github.com/confluentinc/kafka-rest

  <a href="http://kafka-topics-ui.landoop.com">
    <img src="http://landoop.github.io/schema-registry-ui/demo-button.jpg" width="75"/>
  </a>

### Features

* Viewing Avro, JSon and Binary Kafka topics
* Table and JSon views
* Download data from Kafka topics
* Stream from beginning or real-time capturing
* Automatically topic data identification (Avro|Json|Binary)
* Base64 decoding and parsing of binary messages
* Identify and visualize topics with config overrides
* [schema-registry-ui](https://github.com/Landoop/schema-registry-ui) integration

## Preview

<img src="http://landoop.github.io/schema-registry-ui/v0.3.animation.gif">

## Configuration

* By default `kafka-topics-ui` points to the kafka-rest server at http://localhost:8082 To point it to a different kafka-rest server, update `app/src/env.js`
* Enable CORS in the kafka-rest server by adding to `/opt/confluent/etc/kafka-rest/kafka-rest.properties` the following and restart the service

```
access.control.allow.methods=GET,POST,OPTIONS
access.control.allow.origin=*
```

## Run

#### Prerequisites
* You need to download dependencies with `bower`. Find out more [here](http://bower.io)
* You need a `web server` to serve the app.

#### Steps

    git clone https://github.com/Landoop/kafka-topics-ui.git
    cd kafka-topics-ui
    bower install
    http-server app

Web UI will be available at `http://localhost:8080`

#### Nginx config

If you use `nginx` to serve this ui, let angular manage routing with

    location / {
        try_files $uri $uri/ /index.html =404;
        root /folder-with-schema-registry-ui/;
    }

## License

The project is licensed under the Apache 2 license.