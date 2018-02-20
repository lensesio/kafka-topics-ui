## Kafka Topics UI ##

[![](https://images.microbadger.com/badges/image/landoop/kafka-topics-ui.svg)](http://microbadger.com/images/landoop/kafka-topics-ui)

This is a small docker image for Landoop's kafka-topics-ui.
It serves the kafka-topics-ui from port 8000 by default.
A live version can be found at <https://kafka-topics-ui.landoop.com>

The software is stateless and the only necessary option is your Kafka REST Proxy
URL:

    docker run --rm -it -p 8000:8000 \
               -e "KAFKA_REST_PROXY_URL=http://kafka.rest.proxy.url" \
               landoop/kafka-topics-ui

Visit http://localhost:8000 to see the UI.

### Proxying Kafka REST Proxy

If you have CORS issues or want to pass through firewalls and maybe share your
server, we added the `PROXY` option. Run the container with `-e PROXY=true` and
Caddy server will proxy the traffic to the REST Proxy:

    docker run --rm -it -p 8000:8000 \
               -e "KAFKA_REST_PROXY_URL=http://kafka.rest.proxy.url" \
               -e "PROXY=true" \
               landoop/kafka-topics-ui

> **Important**: When proxying, for the `KAFKA_REST_PROXY_URL` you have to use
> an IP address or a domain that can be resolved to it. **You can't use**
> `localhost` even if you serve Kafka REST port from your localhost. The reason
> for this is that a docker container has its own network, so your _localhost_
> is different from the container's _localhost_. As an example, if you are in
> your home network and have an IP address of `192.168.5.65` and run Kafka REST
> from your computer, instead of `http://127.0.1:8082` you must use
> `http://192.168.5.65:8082`.

If your REST Proxy uses self-signed SSL certificates, you can use the
`PROXY_SKIP_VERIFY=true` environment variable to instruct the proxy to
not verify the backend TLS certificate.

# Configuration options

## Kafka Topics UI

You can control most of Kafka Topics UI settings via environment variables:

 * `KAFKA_REST_PROXY_URL`
 * `MAX_BYTES` (default 50000)
 * `RECORD_POLL_TIMEOUT` (default 2000)
 * `DEBUG_LOGS_ENABLED` (default true).

## Docker Options

- `PROXY=[true|false]`
  
  Whether to proxy REST Proxy endpoint via the internal webserver
- `PROXY_SKIP_VERIFY=[true|false]`
  
  Whether to accept self-signed certificates when proxying REST Proxy
  via https
- `PORT=[PORT]`
  
  The port number to use for kafka-topics-ui. The default is `8000`.
  Usually the main reason for using this is when you run the
  container with `--net=host`, where you can't use docker's publish
  flag (`-p HOST_PORT:8000`).
- `CADDY_OPTIONS=[OPTIONS]`
  
  The webserver that powers the image is Caddy. Via this variable
  you can add options that will be appended to its configuration
  (Caddyfile). Variables than span multiple lines are supported.
  
  As an example, you can set Caddy to not apply timeouts via:
  
      -e "CADDY_OPTIONS=timeouts none"
  
  Or you can set basic authentication via:
  
      -e "CADDY_OPTIONS=basicauth / [USER] [PASS]"

# Kafka REST Proxy Configuration

For Kafka REST Proxy 3.2.x you should set `consumer.request.timeout.ms=30000`.
Without this option, Kafka REST Proxy will fail to return messages for large
topics. Although the default value is `1000`, a bug in the Kafka REST code
prevents you from manually setting (depending on some other consumer options) a
value lower than `30000`. It is also a good idea to set
`consumer.max.poll.interval.ms` to a lower value than `consumer.request.timeout.ms`
as per Kafka's docs.

If you don't wish to proxy REST Proxy's api, you should permit CORS via setting
`access.control.allow.methods=GET,POST,PUT,DELETE,OPTIONS` and
`access.control.allow.origin=*`.

# Logging

In the latest iterations, the container will print informational messages during
startup at stderr and web server logs at stdout. This way you may sent the logs
(stdout) to your favorite log management solution.
