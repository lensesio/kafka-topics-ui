FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add needed tools
RUN apk add --no-cache ca-certificates wget \
    && echo "progress = dot:giga" | tee /etc/wgetrc

# Add and Setup Caddy webserver
RUN wget "https://github.com/mholt/caddy/releases/download/v0.10.11/caddy_v0.10.11_linux_amd64.tar.gz" -O /caddy.tgz \
    && mkdir caddy \
    && tar xzf caddy.tgz -C /caddy \
    && rm -f /caddy.tgz

# Add and Setup Kafka-Topics-Ui
ENV KAFKA_TOPICS_UI_VERSION="0.9.3"
RUN wget "https://github.com/Landoop/kafka-topics-ui/releases/download/v${KAFKA_TOPICS_UI_VERSION}/kafka-topics-ui-${KAFKA_TOPICS_UI_VERSION}.tar.gz" \
         -O /kafka-topics-ui.tar.gz \
    && mkdir /kafka-topics-ui \
    && tar xzf /kafka-topics-ui.tar.gz -C /kafka-topics-ui \
    && rm -f /kafka-topics-ui.tar.gz

# Add configuration and runtime files
ADD Caddyfile /caddy/Caddyfile.template
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000
ENTRYPOINT ["/run.sh"]
