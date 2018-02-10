## Kafka Topics UI ##

[![](https://images.microbadger.com/badges/image/landoop/kafka-topics-ui.svg)](http://microbadger.com/images/landoop/kafka-topics-ui)

This is a small docker image for Landoop's kafka-topics-ui.
It serves the kafka-topics-ui from port 8000.
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

You can control most of Kafka Topics UI settings via environment variables:

 * `MAX_BYTES` (default 50000)
 * `RECORD_POLL_TIMEOUT` (default 2000)
 * `DEBUG_LOGS_ENABLED` (default true).

## Caddy options

If you are using the internal Caddy proxy to contact the REST proxy, you can apply further configuration via the environment variable `CADDY_OPTIONS`.

### CADDY_OPTIONS

For instance, if you want to disable timeouts, you can do so via the caddy options:

    docker run --rm -it -p 8000:8000 \
               -e "CADDY_OPTIONS=timeouts none" \
               landoop/kafka-topics-ui

# Kafka REST Proxy Configuration

For Kafka REST Proxy 3.2.x you should set `consumer.request.timeout.ms=30000`.
Without this option, Kafka REST Proxy will fail to return messages for large
topics. Although the default value is `1000`, a bug in the Kafka REST code
prevents you from manually setting (depending on some other consumer options) a
value lower than `30000`.

# Logging

In the latest iterations, the container will print informational messages during
startup at stderr and web server logs at stdout. This way you may sent the logs
(stdout) to your favorite log management solution.
