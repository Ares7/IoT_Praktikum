# Data Layer

This is the initial code of kafka streams. The code listen from `stream-plaintext-input` topic and writes to `streams-pipe-output` topic.
It also sends the processed data to Elasticsearch. You can see index name in `KafkaNode.java`

**Make sure you have this version of kafka, the kafka version in the manual does not work!!!**
- kafka link: http://apache.lauf-forum.at/kafka/1.0.0/kafka_2.11-1.0.0.tgz 

**Make sure you have this version of ElasticSearch!!!**

- Elasticsearch link: https://www.elastic.co/downloads/past-releases/elasticsearch-2-4-2

to run elasticsearch,create new user ,download, unzip and `bin/elasticsearch`.

Make sure  your `zookeeperd` is running. (*sudo apt-get install zookeeperd*)  

To run kafka `bin/kafka-server-start.sh config/server.properties`

To run maven, `mvn clean package` ==> `mvn exec:java -Dexec.mainClass=myapps.KafkaNode`

To send data to channel  `python send_data.py`

To get data from channel `bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic streams-sensor-output`

Kafka Streams documentation: https://kafka.apache.org/10/documentation/streams/quickstart
