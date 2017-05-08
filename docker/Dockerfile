FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add needed tools
RUN apk add --no-cache ca-certificates wget \
    && echo "progress = dot:giga" | tee /etc/wgetrc

# Add and Setup Caddy webserver
RUN wget "https://caddyserver.com/download/build?os=linux&arch=amd64&features=" -O /caddy.tgz \
    && mkdir caddy \
    && tar xzf caddy.tgz -C /caddy \
    && rm -f /caddy.tgz

# Add and Setup Kafka-Topics-Ui
RUN wget https://github.com/Landoop/kafka-topics-ui/releases/download/v0.9.1/kafka-topics-ui-0.9.1.tar.gz \
         -O /kafka-topics-ui.tar.gz \
    && mkdir /kafka-topics-ui \
    && tar xzf /kafka-topics-ui.tar.gz -C /kafka-topics-ui \
    && rm -f /kafka-topics-ui.tar.gz

# Add configuration and runtime files
ADD Caddyfile /caddy/
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000
ENTRYPOINT ["/run.sh"]
