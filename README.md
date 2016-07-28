# kafka-topics-ui

[![release](http://github-release-version.herokuapp.com/github/landoop/kafka-topics-ui/release.svg?style=flat)](https://github.com/landoop/kafka-topics-ui/releases/latest)

UI for viewing **Kafka topics** using the Kafka Rest proxy built in angular - https://github.com/confluentinc/kafka-rest

  <a href="http://kafka-topics-ui.landoop.com">
    <img src="http://landoop.github.io/schema-registry-ui/demo-button.jpg" width="75"/>
  </a>

### Features

* Identifies and visualizes Kafka topics and config overrides
* Automatically detects data types (Avro|Json|Binary)
* Base64 decodes and parses of binary topics
* Provides Table and JSon views
* Allows downloading data from Kafka topics
* Integrated with [schema-registry-ui](https://github.com/Landoop/schema-registry-ui)
* Displays number of partitions and replication factor per topic
* [TODO] Stream from beginning or real-time capturing

## Preview

<img src="http://landoop.github.io/schema-registry-ui/v0.3.animation.gif">

## Configuration

* By default `kafka-topics-ui` points to the kafka-rest server at http://localhost:8082 To point it to a different kafka-rest server, update `app/src/env.js`
* Enable CORS

If using nginx

    location / {
      add_header 'Access-Control-Allow-Origin' "$http_origin" always;
      add_header 'Access-Control-Allow-Credentials' 'true' always;
      add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
      add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With' always;

      proxy_pass http://kafka-rest-server-url:8082;
      proxy_redirect off;

      proxy_set_header  X-Real-IP  $remote_addr;
      proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header  Host $http_host;
    }

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
        root /folder-with-kafka-topics-ui/;
    }

## License

The project is licensed under the Apache 2 license.