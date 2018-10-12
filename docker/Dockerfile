FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

# Add needed tools
RUN addgroup -g 1000 landoop \
    && adduser -D -u 1000 -G landoop landoop \
    && mkdir  /landoop \
    && apk add --no-cache ca-certificates wget \
    && echo "progress = dot:giga" | tee /etc/wgetrc

ADD . /landoop
RUN chown landoop:landoop -R /landoop
USER 1000:1000
WORKDIR /landoop
# Add and Setup Caddy webserver
RUN wget "https://github.com/mholt/caddy/releases/download/v0.10.11/caddy_v0.10.11_linux_amd64.tar.gz" -O caddy.tgz \
    && mkdir caddy \
    && tar xzf caddy.tgz -C caddy \
    && rm -f caddy.tgz

## Add and Setup Kafka-Topics-Ui
ENV KAFKA_TOPICS_UI_VERSION="0.9.4"
RUN wget "https://github.com/Landoop/kafka-topics-ui/releases/download/v${KAFKA_TOPICS_UI_VERSION}/kafka-topics-ui-${KAFKA_TOPICS_UI_VERSION}.tar.gz" \
         -O kafka-topics-ui.tar.gz \
    && mkdir kafka-topics-ui \
    && tar xzf kafka-topics-ui.tar.gz -C kafka-topics-ui \
    && rm -f kafka-topics-ui.tar.gz

## Add configuration and runtime files
RUN chmod +x run.sh \
    && mv Caddyfile caddy/Caddyfile.template

EXPOSE 8000
ENTRYPOINT ["./run.sh"]
