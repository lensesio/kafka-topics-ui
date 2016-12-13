// Replace with the URL where a Kafka REST service is listening

var clusters =
[
  {
  NAME:"prod",
  KAFKA_REST : "localhost:8082",// "https://kafka-rest-proxy.demo.landoop.com"
  // Sets the defaul maximum amount of bytes to fetch from each topic
  MAX_BYTES: "?max_bytes=50000",
  COLOR: "#141414" // Optional

  },
  {
  NAME:"dev",
  KAFKA_REST : "localhost:8083",// "https://kafka-rest-proxy.demo.landoop.com"
  // Sets the defaul maximum amount of bytes to fetch from each topic
  MAX_BYTES: "?max_bytes=50000",
  COLOR: "red" // Optional
  }
];

