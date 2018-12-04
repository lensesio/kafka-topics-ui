#!/bin/sh

PROXY_SKIP_VERIFY="${PROXY_SKIP_VERIFY:-false}"
MAX_BYTES="${MAX_BYTES:-50000}"
RECORD_POLL_TIMEOUT="${RECORD_POLL_TIMEOUT:-2000}"
DEBUG_LOGS_ENABLED="${DEBUG_LOGS_ENABLED:-true}"
INSECURE_PROXY=""
CADDY_OPTIONS="${CADDY_OPTIONS:-}"
EXPERIMENTAL_PROXY_URL="${EXPERIMENTAL_PROXY_URL:-false}"
UI_PORT="${UI_PORT:-8000}"
PORT="${PORT:-8080}"

{
    echo "Landoop Kafka Topics UI ${KAFKA_TOPICS_UI_VERSION}"
    echo "Visit <https://github.com/Landoop/kafka-topics-ui/tree/master/docker>"
    echo "to find more about how you can configure this container."
    echo

    cat /caddy/Caddyfile.template \
        | sed -e "s/8000/$UI_PORT/" > /tmp/Caddyfile

    if echo "$PROXY_SKIP_VERIFY" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
        INSECURE_PROXY=insecure_skip_verify
    fi

    if echo $PROXY | egrep -sq "true|TRUE|y|Y|yes|YES|1" \
            && [[ ! -z "$KAFKA_REST_PROXY_URL" ]]; then
        echo "Enabling proxy."
        cat <<EOF >>/tmp/Caddyfile
proxy /api/kafka-rest-proxy $KAFKA_REST_PROXY_URL {
    without /api/kafka-rest-proxy
    $INSECURE_PROXY
}
EOF
        if echo "$EXPERIMENTAL_PROXY_URL" | egrep -sq "true|TRUE|y|Y|yes|YES|1"; then
            KAFKA_REST_PROXY_URL=api/kafka-rest-proxy
        else
            KAFKA_REST_PROXY_URL=/api/kafka-rest-proxy
        fi
    fi

    if [[ -z "$KAFKA_REST_PROXY_URL" ]]; then
        echo "Kafka REST Proxy URL was not set via KAFKA_REST_PROXY_URL environment variable."
    else
        echo "Kafka REST Proxy URL to $KAFKA_REST_PROXY_URL."
        cat <<EOF >/tmp/env.js
var clusters = [
   {
     NAME:"default",
     KAFKA_REST: "$KAFKA_REST_PROXY_URL",
     MAX_BYTES: "$MAX_BYTES",
     RECORD_POLL_TIMEOUT: "$RECORD_POLL_TIMEOUT",
     DEBUG_LOGS_ENABLED: $DEBUG_LOGS_ENABLED
   }
]
EOF
    fi

    if [[ -n "${CADDY_OPTIONS}" ]]; then
        echo "Applying custom options to Caddyfile"
        cat <<EOF >>/tmp/Caddyfile
$CADDY_OPTIONS
EOF
    fi

    # Here we emulate the output by Caddy. Why? Because we can't
    # redirect caddy to stderr as the logging would also get redirected.
    cat <<EOF
Note: if you use a UI_PORT lower than 1024, please note that kafka-topics-ui can
now run under any user. In the future a non-root user may become the default.
In this case you will have to explicitly allow binding to such UI_PORTs, either by
setting the root user or something like '--sysctl net.ipv4.ip_unprivileged_UI_PORT_start=0'.

Activating privacy features... done."
http://0.0.0.0:$UI_PORT"
EOF
} 1>&2

#nginx
apk update
apk add nginx
apk add apache2-utils
htpasswd -b -c /etc/nginx/.htpasswd admin W4yI54Ndy5oM3gA
cat <<EOF >/etc/nginx/nginx.conf
events {
  worker_connections  1024;
}
http {
    server {
      listen $PORT;

      server_name _;

      location / {
          auth_basic           "Restricted Area";
          auth_basic_user_file /etc/nginx/.htpasswd;
          proxy_pass http://localhost:$UI_PORT/;
      }
    }
}
EOF
mkdir -p /run/nginx
/usr/sbin/nginx

exec /caddy/caddy -conf /tmp/Caddyfile -quiet
