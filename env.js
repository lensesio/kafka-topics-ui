// Replace with the URL where a Kafka REST service is listening
var clusters = [{
        NAME: "prod",
        KAFKA_REST: "https://kafka-rest-proxy.demo.landoop.com",
        KAFKA_BACKEND: "http://fast-data-backend.demo.landoop.com/api/rest",
        MAX_BYTES: "?max_bytes=50000", 	// Sets the default maximum amount of bytes to fetch from each topic
        //COLOR: "#141414" // Optional
    }, {
        NAME: "dev",
        KAFKA_REST: "localhost:8083",
        KAFKA_BACKEND: "http://fast-data-backend.demo.landoop.com/api/rest",
        MAX_BYTES: "?max_bytes=50000",
        COLOR: "red"
    }];