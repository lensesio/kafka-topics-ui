// Replace with the URL where a Kafka REST service is listening

var clusters =
[
  {
  NAME:"prod",
  KAFKA_REST : "localhost:8082",// "https://kafka-rest-proxy.demo.landoop.com"
  KAFKA_REST_ENV : {
    // Sets the defaul maximum amount of bytes to fetch from each topic
    MAX_BYTES: "?max_bytes=50000",
    // Pre-configure the Data Type on particular well-known topics
    JSON_TOPICS: ["_schemas"],
    BINARY_TOPICS: ["connect-configs", "connect-offsets", "__consumer_offsets", "_confluent-monitoring", "_confluent-controlcenter", "__confluent.support.metr"],
    // If a topic starts with this particular prefix - it's a control topic
    CONTROL_TOPICS: ["_confluent-controlcenter", "connect-configs", "connect-offsets", "__confluent", "__consumer_offsets", "_confluent-monitoring", "connect-status", "_schemas"],
    },
    COLOR: "#141414" // Optional

  },
  {
  NAME:"dev",
  KAFKA_REST : "localhost:8083",// "https://kafka-rest-proxy.demo.landoop.com"
  KAFKA_REST_ENV : {
    // Sets the defaul maximum amount of bytes to fetch from each topic
    MAX_BYTES: "?max_bytes=50000",
    // Pre-configure the Data Type on particular well-known topics
    JSON_TOPICS: ["_schemas"],
    BINARY_TOPICS: ["connect-configs", "connect-offsets", "__consumer_offsets", "_confluent-monitoring", "_confluent-controlcenter", "__confluent.support.metr"],
    // If a topic starts with this particular prefix - it's a control topic
    CONTROL_TOPICS: ["_confluent-controlcenter", "connect-configs", "connect-offsets", "__confluent", "__consumer_offsets", "_confluent-monitoring", "connect-status", "_schemas"],
    },
    COLOR: "red" // Optional
  }
];

