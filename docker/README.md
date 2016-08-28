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

If you also use our
[Schema Registry UI](https://github.com/Landoop/schema-registry-ui), you may
link directly to it from Kafka Topics UI, using the `SCHEMAREGISTRY_UI_URL`
variable:

    docker run --rm -it -p 8000:8000 \
               -e "SCHEMAREGISTRY_UI_URL=http://schema-registry-ui.url" \
               -e "KAFKA_REST_PROXY_URL=http://kafka.rest.proxy.url" \
               landoop/kafka-topics-ui
