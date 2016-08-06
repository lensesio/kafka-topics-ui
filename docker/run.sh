#!/bin/sh

if [[ -z "$SCHEMAREGISTRY_UI_URL" ]]; then
    echo "Schema Registry URL was not set via SCHEMAREGISTRY_UI_URL environment variable."
else
    echo "Setting Schema Registry UI URL to $SCHEMAREGISTRY_UI_URL."
    sed -e 's|^SCHEMA_REGISTRY_UI:.*|  SCHEMA_REGISTRY_UI: "'"$SCHEMAREGISTRY_UI_URL"'",|' \
        -i /kafka-topics-ui/combined.js
fi

if [[ -z "$KAFKA_REST_PROXY_URL" ]]; then
    echo "Kafka REST Proxy URL was not set via KAFKA_REST_PROXY_URL environment variable."
else
    echo "Kafka REST Proxy URL to $KAFKA_REST_PROXY_URL."
    sed -e 's|KAFKA_REST:.*|  KAFKA_REST: "'"$KAFKA_REST_PROXY_URL"'",|' \
        -i /kafka-topics-ui/combined.js
fi

if [[ -z "$KAFKATOPICS_UI_URL" ]]; then
    echo "Kafka Topics UI URL was not set via KAFKATOPICS_UI_URL environment variable."
else
    echo "Setting Kafka Topics UI URL to $KAFKATOPICS_UI_URL."
    sed -e 's|^\s*urlTopics.*|      urlTopics: "'"$KAFKATOPICS_UI_URL"'"|' \
        -i /kafka-topics-ui/combined.js
fi

if [[ -z "$KAFKACONNECT_UI_URL" ]]; then
    echo "Kafka Connect UI URL was not set via KAFKACONNECT_UI_URL environment variable."
else
    echo "Setting Kafka Connect UI URL to $KAFKACONNECT_UI_URL."
    sed -e 's|^\s*urlConnect.*|      urlConnect: "'"$KAFKACONNECT_UI_URL"'"|' \
        -i /kafka-topics-ui/combined.js
fi

if [[ -z "$KAFKAMONITOR_UI_URL" ]]; then
    echo "Kafka Monitor UI URL was not set via KAFKAMONITOR_UI_URL environment variable."
else
    echo "Setting Kafka Monitor UI URL to $KAFKAMONITOR_UI_URL."
    sed -e 's|^\s*urlMonitoring.*|      urlMonitoring: "'"$KAFKAMONITOR_UI_URL"'"|' \
        -i /kafka-topics-ui/combined.js
fi

if [[ -z "$KAFKAALERTS_UI_URL" ]]; then
    echo "Kafka Alerts UI URL was not set via KAFKAALERTS_UI_URL environment variable."
else
    echo "Setting Kafka Alerts UI URL to $KAFKAALERTS_UI_URL."
    sed -e 's|^\s*urlAlerts.*|      urlAlerts: "'"$KAFKAALERTS_UI_URL"'"|' \
        -i /kafka-topics-ui/combined.js
fi

if [[ -z "$KAFKAMANAGER_UI_URL" ]]; then
    echo "Kafka Manager UI URL was not set via KAFKAMANAGER_UI_URL environment variable."
else
    echo "Setting Kafka Manager UI URL to $KAFKAMANAGER_UI_URL."
    sed -e 's|^\s*urlManager.*|      urlManager: "'"$KAFKAMANAGER_UI_URL"'"|' \
        -i /kafka-topics-ui/combined.js
fi

echo "Final configuration is:"
echo
cat /kafka-topics-ui/combined.js
echo

exec /caddy/caddy -conf /caddy/Caddyfile
