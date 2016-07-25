# kafka-topics-ui

[![release](http://github-release-version.herokuapp.com/github/landoop/schema-registry-ui/release.svg?style=flat)](https://github.com/landoop/schema-registry-ui/releases/latest)

Web UI for viewing Kafka topics using Confluent's Kafka Rest built in angular - https://github.com/confluentinc/kafka-rest

  <a href="http://kafka-topics-ui.landoop.com">
    <img src="http://landoop.github.io/schema-registry-ui/demo-button.jpg" width="75"/>
  </a>

### Features

* Schema registration and compatibility checks
* Generate CURL commands
* Search Subjects & Schemas
* Avro + Table schema views
* Routed urls

## Preview

<img src="http://landoop.github.io/schema-registry-ui/v0.3.animation.gif">

## Configuration

* By default `schema-registry-ui` points to the schema-registry at http://localhost:8081 To point it to a different schema-registry, update `app/src/env.js`
* Enable CORS in the schema-registry by adding to `/opt/confluent-2.0.1/etc/schema-registry/schema-registry.properties` the following and restart the service

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

journalctl -u confluent-kafka-rest-proxy --since "10 min ago" -f
