FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add needed tools
RUN apk add --no-cache ca-certificates wget \
    && echo "progress = dot:giga" | tee /etc/wgetrc

# Add and Setup Caddy webserver
RUN wget "https://github.com/mholt/caddy/releases/download/v0.9.5/caddy_linux_amd64.tar.gz" -O /caddy.tgz \
    && mkdir caddy \
    && tar xzf caddy.tgz -C /caddy \
    && mv /caddy/caddy_linux_amd64 /caddy/caddy \
    && rm -f /caddy.tgz

# Add and Setup Kafka-Topics-Ui
RUN wget https://github.com/Landoop/kafka-topics-ui/releases/download/v0.9.2/kafka-topics-ui-0.9.2.tar.gz \
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
