#!/bin/sh

if echo $PROXY | egrep -sq "true|TRUE|y|Y|yes|YES|1" \
        && [[ ! -z "$KAFKA_REST_PROXY_URL" ]]; then
    echo "Enabling proxy."
    cat <<EOF >>/caddy/Caddyfile
proxy /api/kafka-rest-proxy $KAFKA_REST_PROXY_URL {
    without /api/kafka-rest-proxy
}
EOF
KAFKA_REST_PROXY_URL=/api/kafka-rest-proxy
fi

if [[ -z "$SCHEMAREGISTRY_UI_URL" ]]; then
    echo "Schema Registry URL was not set via SCHEMAREGISTRY_UI_URL environment variable."
    sed -e 's|^\s*urlSchema:.*|      urlSchema: ""|' -i /kafka-topics-ui/combined.js
else
    echo "Setting Schema Registry UI URL to $SCHEMAREGISTRY_UI_URL."
    sed -e 's|var UI_SCHEMA_REGISTRY =.*|var UI_SCHEMA_REGISTRY = "'"$SCHEMAREGISTRY_UI_URL"'";|' \
        -e 's|^\s*urlSchema:.*|      urlSchema: "'"$SCHEMAREGISTRY_UI_URL"'"|' \
        -i /kafka-topics-ui/combined.js
fi

if [[ -z "$KAFKA_REST_PROXY_URL" ]]; then
    echo "Kafka REST Proxy URL was not set via KAFKA_REST_PROXY_URL environment variable."
else
    echo "Kafka REST Proxy URL to $KAFKA_REST_PROXY_URL."
    sed -e 's|var KAFKA_REST =.*|var KAFKA_REST = "'"$KAFKA_REST_PROXY_URL"'";|' \
        -e 's|KAFKA_REST:.*|KAFKA_REST: "'"$KAFKA_REST_PROXY_URL"'",|' \
        -i /kafka-topics-ui/combined.js
fi

# echo "Final configuration is:"
# echo
# cat /kafka-topics-ui/combined.js
#echo

exec /caddy/caddy -conf /caddy/Caddyfile
