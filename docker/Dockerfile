FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add needed tools
RUN apk add --no-cache ca-certificates wget \
    && echo "progress = dot:giga" | tee /etc/wgetrc

# Add and Setup Caddy webserver
RUN wget "https://github.com/mholt/caddy/releases/download/v0.10.11/caddy_v0.10.11_linux_amd64.tar.gz" -O /caddy.tgz \
    && mkdir caddy \
    && tar xzf caddy.tgz -C /caddy --no-same-owner \
    && rm -f /caddy.tgz

# Add and Setup Kafka-Topics-Ui
ENV KAFKA_TOPICS_UI_VERSION="0.9.4"
RUN wget "https://github.com/Landoop/kafka-topics-ui/releases/download/v${KAFKA_TOPICS_UI_VERSION}/kafka-topics-ui-${KAFKA_TOPICS_UI_VERSION}.tar.gz" \
         -O /kafka-topics-ui.tar.gz \
    && mkdir /kafka-topics-ui \
    && tar xzf /kafka-topics-ui.tar.gz -C /kafka-topics-ui --no-same-owner \
    && rm -f /kafka-topics-ui.tar.gz \
    && rm -f /kafka-topics-ui/env.js \
    && ln -s /tmp/env.js /kafka-topics-ui/env.js

# Add configuration and runtime files
ADD Caddyfile /caddy/Caddyfile.template
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000

# USER nobody:nogroup
ENTRYPOINT ["/run.sh"]
