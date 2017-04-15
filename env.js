// Replace with the URL where a Kafka REST service is listening
var clusters = [{
        NAME: "prod",
        KAFKA_REST: "http://cloudera03.landoop.com:16781/api/kafka-rest-proxy",
        MAX_BYTES: "500000", 	// Sets the default maximum amount of bytes to fetch from each topic
        COLOR: "#141414" // Optional
    }, {
        NAME: "dev",
        KAFKA_REST: "localhost:8083",
        MAX_BYTES: "500000",
        COLOR: "red"
    }];