// Replace with the URL where a Kafka REST service is listening
var clusters = [{
        NAME: "prod",
        KAFKA_REST: "localhost:8082",
        MAX_BYTES: "?max_bytes=50000", 	// Sets the defaul maximum amount of bytes to fetch from each topic
        COLOR: "#141414" // Optional
    }, {
        NAME: "dev",
        KAFKA_REST: "localhost:8083",
        MAX_BYTES: "?max_bytes=50000",
        COLOR: "red"
    }];