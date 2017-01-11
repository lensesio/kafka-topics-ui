var clusters = [{
        NAME: "UAT",
        KAFKA_REST: "https://kafka-rest-proxy.demo.landoop.com",
        MAX_BYTES: "?max_bytes=50000",     // Sets the defaul maximum amount of bytes to fetch from each topic
        COLOR: "#141414" // Optional
    }, {
        NAME: "SIT",
        KAFKA_REST: "https://cp2.demo.playground.landoop.com/api/kafka-rest-proxy",
        MAX_BYTES: "?max_bytes=50000",
        COLOR: "#141414"
    }];