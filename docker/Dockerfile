FROM alpine
MAINTAINER Marios Andreopoulos <marios@landoop.com>

WORKDIR /
# Add and Setup Caddy webserver
ADD https://caddyserver.com/download/build?os=linux&arch=amd64&features=minify /caddy.tgz
RUN mkdir caddy && \
    tar xzf caddy.tgz -C /caddy && \
    rm -f /caddy.tgz
# Add and Setup Schema-Registry-Ui
ADD https://github.com/Landoop/kafka-topics-ui/releases/download/v0.7/kafka-topics-ui-0.7.tar.gz /kafka-topics-ui.tar.gz
RUN mkdir /kafka-topics-ui && \
    tar xzf /kafka-topics-ui.tar.gz -C /kafka-topics-ui && \
    rm -f /kafka-topics-ui.tar.gz

# Add configuration and runtime files
ADD Caddyfile /caddy/
ADD run.sh /
RUN chmod +x /run.sh

EXPOSE 8000
ENTRYPOINT ["/run.sh"]
